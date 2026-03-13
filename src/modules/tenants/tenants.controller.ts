import { Body, Controller, Delete, Get, Param, Put, Req, UseGuards } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { Roles } from '../../common/roles.decorator'
import { UserRole, TenantStatus } from '../../common/enums'
import { CurrentUser } from '../../common/current-user.decorator'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { ChangePlanDto } from './dto/change-plan.dto'
import { ActivityLogService } from '../../common/activity-log.service'

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class TenantsController {
  constructor(
    private tenantsService: TenantsService,
    private activityLogService: ActivityLogService,
  ) {}

  @Get()
  async list() {
    return this.tenantsService.list()
  }

  @Get('me')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ORG_OWNER,
    UserRole.GAS_MANAGER,
    UserRole.FUEL_MANAGER,
    UserRole.SALES_STAFF,
  )
  async getMyTenant(@CurrentUser() user: any) {
    if (!user?.tenant_id) {
      return null
    }
    return this.tenantsService.getById(user.tenant_id)
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.tenantsService.getById(id)
  }

  @Put(':id/suspend')
  async suspend(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.tenantsService.updateStatus(id, TenantStatus.SUSPENDED)
    await this.activityLogService.logEvent({
      tenantId: id,
      userId: user?.id,
      action: 'tenant.suspend',
      description: `Tenant suspended by ${user?.email ?? 'system'}.`,
      ipAddress: req?.ip,
    })
    return result
  }

  @Put(':id/activate')
  async activate(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.tenantsService.updateStatus(id, TenantStatus.ACTIVE)
    await this.activityLogService.logEvent({
      tenantId: id,
      userId: user?.id,
      action: 'tenant.activate',
      description: `Tenant activated by ${user?.email ?? 'system'}.`,
      ipAddress: req?.ip,
    })
    return result
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.tenantsService.updateDetails(id, dto)
    await this.activityLogService.logEvent({
      tenantId: id,
      userId: user?.id,
      action: 'tenant.update',
      description: `Tenant details updated by ${user?.email ?? 'system'}.`,
      ipAddress: req?.ip,
    })
    return result
  }

  @Put(':id/plan')
  async changePlan(
    @Param('id') id: string,
    @Body() dto: ChangePlanDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const result = await this.tenantsService.changePlan(id, dto)
    await this.activityLogService.logEvent({
      tenantId: id,
      userId: user?.id,
      action: 'tenant.plan_change',
      description: `Tenant plan changed by ${user?.email ?? 'system'}.`,
      ipAddress: req?.ip,
    })
    return result
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any, @Req() req: any) {
    const result = await this.tenantsService.delete(id)
    await this.activityLogService.logEvent({
      tenantId: id,
      userId: user?.id,
      action: 'tenant.delete',
      description: `Tenant deleted by ${user?.email ?? 'system'}.`,
      ipAddress: req?.ip,
    })
    return result
  }
}
