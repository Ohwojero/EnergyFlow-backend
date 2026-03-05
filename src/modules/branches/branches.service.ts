import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Branch } from '../../entities/branch.entity'
import { Tenant } from '../../entities/tenant.entity'
import { User } from '../../entities/user.entity'
import { BranchType, TenantPlan, UserRole } from '../../common/enums'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async list(current: { role: UserRole; tenant_id?: string }) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.branchesRepo.find({ relations: ['tenant', 'manager'] })
    }
    if (!current.tenant_id) {
      return []
    }
    await this.ensurePersonalDefaultGasBranch(current.tenant_id)
    return this.branchesRepo.find({
      where: { tenant: { id: current.tenant_id } },
      relations: ['tenant', 'manager'],
    })
  }

  async listByType(
    current: { role: UserRole; tenant_id?: string },
    type: BranchType,
  ) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.branchesRepo.find({ where: { type }, relations: ['tenant', 'manager'] })
    }
    if (!current.tenant_id) {
      return []
    }
    if (type === BranchType.GAS) {
      await this.ensurePersonalDefaultGasBranch(current.tenant_id)
    }
    return this.branchesRepo.find({
      where: { type, tenant: { id: current.tenant_id } },
      relations: ['tenant', 'manager'],
    })
  }

  async create(
    current: { user_id?: string; role: UserRole; tenant_id?: string },
    dto: CreateBranchDto,
  ) {
    const tenantId =
      current.role === UserRole.SUPER_ADMIN
        ? dto.tenant_id
        : await this.resolveTenantIdFromCurrentUser(current)
    if (!tenantId) {
      throw new BadRequestException('Missing tenant_id')
    }
    const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    if (tenant.subscription_plan === TenantPlan.PERSONAL) {
      throw new BadRequestException('Personal plan does not support branches')
    }

    const normalizedName = dto.name.trim()
    const normalizedLocation = dto.location.trim()
    const normalizedManagerName = dto.manager_name?.trim()
    if (!normalizedName || !normalizedLocation) {
      throw new BadRequestException('Branch name and location are required')
    }
    if (!normalizedManagerName) {
      throw new BadRequestException('Manager name is required')
    }
    await this.ensureUniqueBranchName(tenantId, dto.type, normalizedName)

    let manager: User | null = null
    const managerId =
      dto.manager_id ??
      current.user_id ??
      (current as any)?.id ??
      (current as any)?.sub
    if (managerId) {
      manager = await this.usersRepo.findOne({
        where: { id: managerId, tenant: { id: tenantId } },
      })
      if (!manager && dto.manager_id) {
        throw new BadRequestException('Manager not found for this tenant')
      }
    }
    if (!manager) {
      manager = await this.usersRepo.findOne({
        where: { tenant: { id: tenantId }, role: UserRole.ORG_OWNER },
        order: { created_at: 'ASC' },
      })
    }
    const branch = this.branchesRepo.create({
      name: normalizedName,
      type: dto.type,
      location: normalizedLocation,
      manager_name: normalizedManagerName,
      tenant,
      manager: manager ?? null,
      status: 'active',
    })
    const saved = await this.branchesRepo.save(branch)

    const nextBranchTypes = new Set(tenant.branch_types ?? [])
    nextBranchTypes.add(saved.type)
    tenant.branch_types = Array.from(nextBranchTypes)
    await this.tenantsRepo.save(tenant)

    return saved
  }

  private async resolveTenantIdFromCurrentUser(current: {
    user_id?: string
    role: UserRole
    tenant_id?: string
  }) {
    if (current.tenant_id) return current.tenant_id

    const currentUserId =
      current.user_id ?? (current as any)?.id ?? (current as any)?.sub
    if (!currentUserId) return undefined

    const user = await this.usersRepo.findOne({
      where: { id: currentUserId },
      relations: ['tenant'],
    })
    return user?.tenant?.id
  }

  async update(
    current: { role: UserRole; tenant_id?: string },
    id: string,
    dto: UpdateBranchDto,
  ) {
    const branch = await this.resolveManageableBranch(current, id)

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim()
      if (!normalizedName) {
        throw new BadRequestException('Branch name is required')
      }
      await this.ensureUniqueBranchName(branch.tenant.id, branch.type, normalizedName, branch.id)
      branch.name = normalizedName
    }
    if (dto.location !== undefined) {
      const normalizedLocation = dto.location.trim()
      if (!normalizedLocation) {
        throw new BadRequestException('Location is required')
      }
      branch.location = normalizedLocation
    }
    if (dto.manager_name !== undefined) {
      const normalizedManagerName = dto.manager_name.trim()
      if (!normalizedManagerName) {
        throw new BadRequestException('Manager name is required')
      }
      branch.manager_name = normalizedManagerName
    }
    if (dto.status !== undefined) {
      branch.status = dto.status
    }
    if (dto.manager_id !== undefined) {
      const normalizedManagerId = dto.manager_id.trim()
      if (!normalizedManagerId) {
        branch.manager = null
      } else {
        const manager = await this.usersRepo.findOne({
          where: { id: normalizedManagerId, tenant: { id: branch.tenant.id } },
        })
        if (!manager) {
          throw new BadRequestException('Manager not found for this tenant')
        }
        branch.manager = manager
      }
    }

    await this.branchesRepo.save(branch)
    return this.branchesRepo.findOne({
      where: { id: branch.id },
      relations: ['tenant', 'manager'],
    })
  }

  async archive(current: { role: UserRole; tenant_id?: string }, id: string) {
    const branch = await this.resolveManageableBranch(current, id)
    branch.status = 'inactive'
    await this.branchesRepo.save(branch)
    return this.branchesRepo.findOne({
      where: { id: branch.id },
      relations: ['tenant', 'manager'],
    })
  }

  async remove(current: { role: UserRole; tenant_id?: string }, id: string) {
    const branch = await this.resolveManageableBranch(current, id)
    const tenant = branch.tenant

    try {
      await this.detachUsersFromBranch(branch.id)
      await this.branchesRepo.remove(branch)

      const remaining = await this.branchesRepo.find({
        where: { tenant: { id: tenant.id } },
      })
      const nextBranchTypes = Array.from(new Set(remaining.map((b) => b.type)))
      tenant.branch_types = nextBranchTypes
      await this.tenantsRepo.save(tenant)

      return { success: true }
    } catch (error: any) {
      const detail = error?.detail || error?.message || 'Delete failed due to linked records'
      throw new BadRequestException(detail)
    }
  }

  private async resolveManageableBranch(
    current: { role: UserRole; tenant_id?: string },
    branchId: string,
  ) {
    const branch = await this.branchesRepo.findOne({
      where: { id: branchId },
      relations: ['tenant', 'manager'],
    })
    if (!branch) {
      throw new NotFoundException('Branch not found')
    }

    if (current.role === UserRole.SUPER_ADMIN) {
      return branch
    }

    if (!current.tenant_id || branch.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized branch access')
    }

    return branch
  }

  private async ensureUniqueBranchName(
    tenantId: string,
    type: BranchType,
    name: string,
    excludeId?: string,
  ) {
    const query = this.branchesRepo
      .createQueryBuilder('branch')
      .where(`branch."tenantId" = :tenantId`, { tenantId })
      .andWhere('branch.type = :type', { type })
      .andWhere('LOWER(branch.name) = LOWER(:name)', { name })

    if (excludeId) {
      query.andWhere('branch.id != :excludeId', { excludeId })
    }

    const existing = await query.getOne()
    if (existing) {
      throw new BadRequestException('A branch with this name already exists')
    }
  }

  private async detachUsersFromBranch(branchId: string) {
    const assignedUsers = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.assigned_branches', 'branch')
      .where('branch.id = :branchId', { branchId })
      .getMany()

    for (const user of assignedUsers) {
      user.assigned_branches = (user.assigned_branches ?? []).filter((b) => b.id !== branchId)
      user.assigned_branch_types = Array.from(
        new Set((user.assigned_branches ?? []).map((b) => b.type)),
      )
      await this.usersRepo.save(user)
    }
  }

  private async ensurePersonalDefaultGasBranch(tenantId: string) {
    const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } })
    if (!tenant || tenant.subscription_plan !== TenantPlan.PERSONAL) {
      return
    }

    const existingGas = await this.branchesRepo.findOne({
      where: { tenant: { id: tenantId }, type: BranchType.GAS },
    })
    if (existingGas) {
      if (!(tenant.branch_types ?? []).includes(BranchType.GAS)) {
        tenant.branch_types = [...(tenant.branch_types ?? []), BranchType.GAS]
        await this.tenantsRepo.save(tenant)
      }
      return
    }

    const branch = this.branchesRepo.create({
      name: 'Main Outlet',
      type: BranchType.GAS,
      location: 'Default',
      manager_name: 'Main Outlet',
      tenant,
      manager: null,
      status: 'active',
    })
    await this.branchesRepo.save(branch)

    if (!(tenant.branch_types ?? []).includes(BranchType.GAS)) {
      tenant.branch_types = [...(tenant.branch_types ?? []), BranchType.GAS]
      await this.tenantsRepo.save(tenant)
    }
  }
}
