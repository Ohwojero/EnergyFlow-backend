import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../../common/roles.decorator'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserRole } from '../../common/enums'
import { ActivityLogService } from '../../common/activity-log.service'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private activityLogs: ActivityLogService,
  ) {}

  @Get()
  async list(@CurrentUser() user: any) {
    return this.usersService.listForUser(user)
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async create(@CurrentUser() user: any, @Body() dto: CreateUserDto, @Req() req: any) {
    const created = await this.usersService.create(user, dto)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: created?.tenant_id ?? user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'create_user',
      description: `Created user ${created?.email ?? dto.email}`,
      ipAddress,
    })
    return created
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    const updated = await this.usersService.update(user, id, dto)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: updated?.tenant_id ?? user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'update_user',
      description: `Updated user ${updated?.email ?? id}`,
      ipAddress,
    })
    return updated
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async remove(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const result = await this.usersService.remove(user, id)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'delete_user',
      description: `Deleted user ${id}`,
      ipAddress,
    })
    return result
  }
}
