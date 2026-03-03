import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Tenant } from '../../entities/tenant.entity'
import { ActivityLog } from '../../entities/activity-log.entity'
import { Invoice } from '../../entities/invoice.entity'
import { TenantStatus } from '../../common/enums'

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(ActivityLog) private logsRepo: Repository<ActivityLog>,
    @InjectRepository(Invoice) private invoicesRepo: Repository<Invoice>,
  ) {}

  async dashboard() {
    const totalTenants = await this.tenantsRepo.count()
    const activeTenants = await this.tenantsRepo.count({ where: { status: TenantStatus.ACTIVE } })
    const suspendedTenants = await this.tenantsRepo.count({
      where: { status: TenantStatus.SUSPENDED },
    })
    const totalRevenue = await this.invoicesRepo
      .createQueryBuilder('inv')
      .select('COALESCE(SUM(inv.amount), 0)', 'total')
      .getRawOne()
    return {
      total_tenants: totalTenants,
      active_tenants: activeTenants,
      suspended_tenants: suspendedTenants,
      total_revenue: Number(totalRevenue.total ?? 0),
    }
  }

  async activityLogs(tenantId?: string) {
    if (tenantId) {
      return this.logsRepo.find({
        where: { tenant: { id: tenantId } },
        order: { timestamp: 'DESC' },
        relations: ['tenant', 'user'],
      })
    }
    return this.logsRepo.find({ order: { timestamp: 'DESC' }, relations: ['tenant', 'user'] })
  }

  async billing(tenantId?: string) {
    if (tenantId) {
      return this.invoicesRepo.find({
        where: { tenant: { id: tenantId } },
        order: { payment_date: 'DESC' },
        relations: ['tenant'],
      })
    }
    return this.invoicesRepo.find({ order: { payment_date: 'DESC' }, relations: ['tenant'] })
  }
}
