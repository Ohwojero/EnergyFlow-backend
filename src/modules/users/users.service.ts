import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import bcrypt from 'bcryptjs'
import { User } from '../../entities/user.entity'
import { Tenant } from '../../entities/tenant.entity'
import { Branch } from '../../entities/branch.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { BranchType, TenantPlan, UserRole } from '../../common/enums'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
  ) {}

  async listForUser(current: { user_id: string; role: UserRole; tenant_id?: string }) {
    if (current.role === UserRole.SUPER_ADMIN) {
      return this.usersRepo.find({ relations: ['tenant', 'assigned_branches'] })
    }
    if (!current.tenant_id) {
      return []
    }
    if (current.role === UserRole.GAS_MANAGER || current.role === UserRole.FUEL_MANAGER) {
      const manager = await this.usersRepo.findOne({
        where: { id: current.user_id },
        relations: ['assigned_branches'],
      })
      if (!manager) return []
      const managerBranchIds = new Set((manager.assigned_branches ?? []).map((b) => b.id))
      if (managerBranchIds.size === 0) return []

      const staffUsers = await this.usersRepo.find({
        where: {
          tenant: { id: current.tenant_id },
          role: UserRole.SALES_STAFF,
        },
        relations: ['tenant', 'assigned_branches'],
      })

      return staffUsers.filter((staff) =>
        (staff.assigned_branches ?? []).some((branch) => managerBranchIds.has(branch.id))
      )
    }
    return this.usersRepo.find({
      where: { tenant: { id: current.tenant_id } },
      relations: ['tenant', 'assigned_branches'],
    })
  }

  async create(current: { user_id: string; role: UserRole; tenant_id?: string }, dto: CreateUserDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new BadRequestException('Email already in use')
    }

    const isManager = current.role === UserRole.GAS_MANAGER || current.role === UserRole.FUEL_MANAGER

    if (isManager && dto.role !== UserRole.SALES_STAFF) {
      throw new BadRequestException('Managers can only create sales staff users')
    }

    const tenantId = current.role === UserRole.SUPER_ADMIN ? dto.tenant_id : current.tenant_id
    if (!tenantId) {
      throw new BadRequestException('Missing tenant_id')
    }
    const tenant = await this.tenantsRepo.findOne({ where: { id: tenantId } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    let branchIds = dto.branch_ids ?? []
    let roleToCreate = isManager ? UserRole.SALES_STAFF : dto.role

    if (tenant.subscription_plan === TenantPlan.PERSONAL) {
      roleToCreate = UserRole.SALES_STAFF
      const personalGasBranch = await this.ensurePersonalDefaultGasBranch(tenant)
      if (!personalGasBranch) {
        throw new BadRequestException('Personal plan requires a default gas outlet')
      }
      branchIds = [personalGasBranch.id]
    }

    if (isManager) {
      const manager = await this.usersRepo.findOne({
        where: { id: current.user_id },
        relations: ['assigned_branches'],
      })
      if (!manager) {
        throw new NotFoundException('Manager user not found')
      }
      const managerBranchIds = new Set((manager.assigned_branches ?? []).map((b) => b.id))
      if (managerBranchIds.size === 0) {
        throw new BadRequestException('Manager has no assigned branches')
      }

      if (!branchIds.length) {
        branchIds = [Array.from(managerBranchIds)[0]]
      }

      const includesUnauthorizedBranch = branchIds.some((id) => !managerBranchIds.has(id))
      if (includesUnauthorizedBranch) {
        throw new BadRequestException('Managers can only assign users to their own branches')
      }
    }

    const branches = branchIds.length
      ? await this.branchesRepo.find({ where: { id: In(branchIds), tenant: { id: tenantId } } })
      : []

    if (branchIds.length && branches.length !== branchIds.length) {
      throw new BadRequestException('One or more branches are invalid for this tenant')
    }

    const password_hash = await bcrypt.hash(dto.password, 10)

    const user = this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      role: roleToCreate,
      password_hash,
      tenant,
      assigned_branch_types: branches.map((branch) => branch.type),
      assigned_branches: branches,
      is_active: true,
    })
    const saved = await this.usersRepo.save(user)
    return this.usersRepo.findOne({
      where: { id: saved.id },
      relations: ['tenant', 'assigned_branches'],
    })
  }

  async update(
    current: { user_id: string; role: UserRole; tenant_id?: string },
    id: string,
    dto: UpdateUserDto,
  ) {
    const user = await this.resolveManageableUser(current, id)
    if (user.id === current.user_id) {
      throw new BadRequestException('You cannot edit your own account here')
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.usersRepo.findOne({ where: { email: dto.email } })
      if (existing && existing.id !== user.id) {
        throw new BadRequestException('Email already in use')
      }
      user.email = dto.email
    }

    if (dto.name !== undefined) {
      user.name = dto.name
    }

    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, 10)
    }

    const tenant = user.tenant
    const isManager = current.role === UserRole.GAS_MANAGER || current.role === UserRole.FUEL_MANAGER
    let nextRole = dto.role ?? user.role

    if (tenant.subscription_plan === TenantPlan.PERSONAL || isManager) {
      nextRole = UserRole.SALES_STAFF
    }
    if (nextRole === UserRole.SUPER_ADMIN && current.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only super admin can assign super admin role')
    }
    if (nextRole === UserRole.ORG_OWNER && current.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only super admin can assign org owner role')
    }
    user.role = nextRole

    const currentBranchIds = (user.assigned_branches ?? []).map((b) => b.id)
    let branchIds = dto.branch_ids ?? currentBranchIds

    if (tenant.subscription_plan === TenantPlan.PERSONAL) {
      const personalGasBranch = await this.ensurePersonalDefaultGasBranch(tenant)
      if (!personalGasBranch) {
        throw new BadRequestException('Personal plan requires a default gas outlet')
      }
      branchIds = [personalGasBranch.id]
    }

    if (isManager) {
      const manager = await this.usersRepo.findOne({
        where: { id: current.user_id },
        relations: ['assigned_branches'],
      })
      if (!manager) {
        throw new NotFoundException('Manager user not found')
      }
      const managerBranchIds = new Set((manager.assigned_branches ?? []).map((b) => b.id))
      if (managerBranchIds.size === 0) {
        throw new BadRequestException('Manager has no assigned branches')
      }
      if (!branchIds.length) {
        branchIds = [Array.from(managerBranchIds)[0]]
      }
      const includesUnauthorizedBranch = branchIds.some((branchId) => !managerBranchIds.has(branchId))
      if (includesUnauthorizedBranch) {
        throw new BadRequestException('Managers can only assign users to their own branches')
      }
    }

    const branches = branchIds.length
      ? await this.branchesRepo.find({
          where: { id: In(branchIds), tenant: { id: tenant.id } },
        })
      : []

    if (branchIds.length && branches.length !== branchIds.length) {
      throw new BadRequestException('One or more branches are invalid for this tenant')
    }

    user.assigned_branches = branches
    user.assigned_branch_types = branches.map((branch) => branch.type)

    await this.usersRepo.save(user)
    return this.usersRepo.findOne({
      where: { id: user.id },
      relations: ['tenant', 'assigned_branches'],
    })
  }

  async remove(current: { user_id: string; role: UserRole; tenant_id?: string }, id: string) {
    const user = await this.resolveManageableUser(current, id)
    if (user.id === current.user_id) {
      throw new BadRequestException('You cannot delete your own account')
    }
    if (user.role === UserRole.ORG_OWNER && current.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Org owner account cannot be deleted here')
    }
    await this.usersRepo.remove(user)
    return { success: true }
  }

  private async resolveManageableUser(
    current: { user_id: string; role: UserRole; tenant_id?: string },
    targetUserId: string,
  ) {
    const target = await this.usersRepo.findOne({
      where: { id: targetUserId },
      relations: ['tenant', 'assigned_branches'],
    })
    if (!target) {
      throw new NotFoundException('User not found')
    }

    if (current.role === UserRole.SUPER_ADMIN) {
      return target
    }

    if (!current.tenant_id || target.tenant?.id !== current.tenant_id) {
      throw new BadRequestException('Unauthorized user access')
    }

    if (current.role === UserRole.ORG_OWNER) {
      return target
    }

    if (current.role === UserRole.GAS_MANAGER || current.role === UserRole.FUEL_MANAGER) {
      if (target.role !== UserRole.SALES_STAFF) {
        throw new BadRequestException('Managers can only manage sales staff users')
      }
      const manager = await this.usersRepo.findOne({
        where: { id: current.user_id },
        relations: ['assigned_branches'],
      })
      if (!manager) {
        throw new NotFoundException('Manager user not found')
      }
      const managerBranchIds = new Set((manager.assigned_branches ?? []).map((b) => b.id))
      const targetBranchIds = new Set((target.assigned_branches ?? []).map((b) => b.id))
      const hasOverlap = Array.from(targetBranchIds).some((id) => managerBranchIds.has(id))
      if (!hasOverlap) {
        throw new BadRequestException('Managers can only manage sales staff in their branches')
      }
      return target
    }

    throw new BadRequestException('Unauthorized user access')
  }

  private async ensurePersonalDefaultGasBranch(tenant: Tenant) {
    if (tenant.subscription_plan !== TenantPlan.PERSONAL) return null

    let gasBranch = await this.branchesRepo.findOne({
      where: { tenant: { id: tenant.id }, type: BranchType.GAS },
    })

    if (!gasBranch) {
      gasBranch = this.branchesRepo.create({
        name: 'Main Outlet',
        type: BranchType.GAS,
        location: 'Default',
        tenant,
        manager: null,
        status: 'active',
      })
      gasBranch = await this.branchesRepo.save(gasBranch)
    }

    if (!(tenant.branch_types ?? []).includes(BranchType.GAS)) {
      tenant.branch_types = [...(tenant.branch_types ?? []), BranchType.GAS]
      await this.tenantsRepo.save(tenant)
    }

    return gasBranch
  }
}
