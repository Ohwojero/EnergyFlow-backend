import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from '../../entities/tenant.entity'
import { TenantPlan, TenantStatus } from '../../common/enums'
import { User } from '../../entities/user.entity'
import { Branch } from '../../entities/branch.entity'
import { Invoice } from '../../entities/invoice.entity'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { ChangePlanDto } from './dto/change-plan.dto'

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    @InjectRepository(Invoice) private invoicesRepo: Repository<Invoice>,
  ) {}

  async list() {
    const tenants = await this.tenantsRepo.find()
    return Promise.all(tenants.map((tenant: Tenant) => this.toExtendedTenant(tenant)))
  }

  async getById(id: string) {
    const tenant = await this.tenantsRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    return this.toExtendedTenant(tenant)
  }

  async updateStatus(id: string, status: TenantStatus) {
    const tenant = await this.tenantsRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    tenant.status = status
    const saved = await this.tenantsRepo.save(tenant)
    return this.toExtendedTenant(saved)
  }

  async delete(id: string) {
    const tenant = await this.tenantsRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    await this.tenantsRepo.remove(tenant)
    return { success: true }
  }

  async updateDetails(id: string, dto: UpdateTenantDto) {
    const tenant = await this.tenantsRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    if (dto.name !== undefined) tenant.name = dto.name
    if (dto.owner_name !== undefined) tenant.owner_name = dto.owner_name
    if (dto.owner_email !== undefined) tenant.owner_email = dto.owner_email
    if (dto.branch_types !== undefined) tenant.branch_types = dto.branch_types
    const saved = await this.tenantsRepo.save(tenant)
    return this.toExtendedTenant(saved)
  }

  async changePlan(id: string, dto: ChangePlanDto) {
    const tenant = await this.tenantsRepo.findOne({ where: { id } })
    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }
    if (dto.plan === TenantPlan.PERSONAL) {
      const branchCount = await this.branchesRepo.count({ where: { tenant: { id: tenant.id } } })
      if (branchCount > 0) {
        throw new BadRequestException('Cannot downgrade to personal plan while branches exist')
      }
    }
    tenant.subscription_plan = dto.plan
    const saved = await this.tenantsRepo.save(tenant)
    return this.toExtendedTenant(saved)
  }

  private async toExtendedTenant(tenant: Tenant) {
    const [total_users, total_branches] = await Promise.all([
      this.usersRepo.count({ where: { tenant: { id: tenant.id } } }),
      this.branchesRepo.count({ where: { tenant: { id: tenant.id } } }),
    ])

    const since = new Date()
    since.setDate(since.getDate() - 30)
    const revenue = await this.invoicesRepo
      .createQueryBuilder('inv')
      .select('COALESCE(SUM(inv.amount), 0)', 'total')
      .where('inv.tenantId = :tenantId', { tenantId: tenant.id })
      .andWhere('inv.payment_date >= :since', { since: since.toISOString().slice(0, 10) })
      .getRawOne()

    return {
      id: tenant.id,
      name: tenant.name,
      owner_name: tenant.owner_name,
      owner_email: tenant.owner_email,
      subscription_plan: tenant.subscription_plan,
      status: tenant.status,
      branch_types: tenant.branch_types ?? [],
      created_at: tenant.created_at,
      last_active: tenant.last_active ?? tenant.created_at,
      total_users,
      total_branches,
      monthly_revenue: Number(revenue.total ?? 0),
    }
  }
}
