import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { TenantStatus } from '../../common/enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  // Run daily at 9 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkBillingStatus() {
    this.logger.log('Running billing status check...');
    
    const tenants = await this.tenantRepository.find({
      where: { status: TenantStatus.ACTIVE },
    });

    const now = new Date();
    const tenantsNeedingReminder = [];
    const tenantsToSuspend = [];

    for (const tenant of tenants) {
      const billingStart = tenant.billing_cycle_start || tenant.created_at;
      const daysSinceStart = Math.floor(
        (now.getTime() - billingStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Days 27-28: Send reminder
      if (daysSinceStart >= 27 && daysSinceStart <= 28 && !tenant.payment_reminder_sent) {
        tenantsNeedingReminder.push({
          id: tenant.id,
          name: tenant.name,
          owner_email: tenant.owner_email,
          days_since_start: daysSinceStart,
          plan: tenant.subscription_plan,
        });
        
        // Mark reminder as sent
        tenant.payment_reminder_sent = true;
        await this.tenantRepository.save(tenant);
      }

      // Day 29+: Suspend if no payment
      if (daysSinceStart >= 29 && !tenant.last_payment_date) {
        tenantsToSuspend.push({
          id: tenant.id,
          name: tenant.name,
          owner_email: tenant.owner_email,
          days_since_start: daysSinceStart,
        });
        
        tenant.status = TenantStatus.SUSPENDED;
        await this.tenantRepository.save(tenant);
        this.logger.warn(`Suspended tenant: ${tenant.name} (${tenant.id})`);
      }
    }

    return {
      tenantsNeedingReminder,
      tenantsToSuspend,
      checkedAt: now,
    };
  }

  async getTenantsNeedingAttention() {
    const tenants = await this.tenantRepository.find({
      where: { status: TenantStatus.ACTIVE },
    });

    const now = new Date();
    const needingAttention = [];

    for (const tenant of tenants) {
      const billingStart = tenant.billing_cycle_start || tenant.created_at;
      const daysSinceStart = Math.floor(
        (now.getTime() - billingStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceStart >= 27 && !tenant.last_payment_date) {
        needingAttention.push({
          id: tenant.id,
          name: tenant.name,
          owner_email: tenant.owner_email,
          owner_name: tenant.owner_name,
          plan: tenant.subscription_plan,
          days_since_start: daysSinceStart,
          billing_cycle_start: billingStart,
          payment_reminder_sent: tenant.payment_reminder_sent,
          status: daysSinceStart >= 29 ? 'overdue' : 'reminder',
        });
      }
    }

    return needingAttention;
  }

  async recordPayment(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({ where: { id: tenantId } });
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const now = new Date();
    tenant.last_payment_date = now;
    tenant.billing_cycle_start = now; // Reset billing cycle
    tenant.payment_reminder_sent = false;
    tenant.status = TenantStatus.ACTIVE;

    await this.tenantRepository.save(tenant);
    this.logger.log(`Payment recorded for tenant: ${tenant.name}`);
    
    return tenant;
  }
}
