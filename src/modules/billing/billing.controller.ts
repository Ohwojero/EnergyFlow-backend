import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { UserRole } from '../../common/enums';
import { BillingService } from './billing.service';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('check-status')
  @Roles(UserRole.SUPER_ADMIN)
  async checkBillingStatus() {
    return this.billingService.checkBillingStatus();
  }

  @Get('tenants-needing-attention')
  @Roles(UserRole.SUPER_ADMIN)
  async getTenantsNeedingAttention() {
    return this.billingService.getTenantsNeedingAttention();
  }

  @Post('record-payment/:tenantId')
  @Roles(UserRole.SUPER_ADMIN)
  async recordPayment(@Param('tenantId') tenantId: string) {
    return this.billingService.recordPayment(tenantId);
  }
}
