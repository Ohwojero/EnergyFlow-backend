import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { Roles } from '../../common/roles.decorator'
import { UserRole } from '../../common/enums'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async dashboard() {
    return this.adminService.dashboard()
  }

  @Get('activity-logs')
  async activityLogs(@Query('tenant') tenantId?: string) {
    return this.adminService.activityLogs(tenantId)
  }

  @Get('billing')
  async billing(@Query('tenant') tenantId?: string) {
    return this.adminService.billing(tenantId)
  }
}
