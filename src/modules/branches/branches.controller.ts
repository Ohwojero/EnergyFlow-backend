import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { BranchesService } from './branches.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'
import { Roles } from '../../common/roles.decorator'
import { UserRole } from '../../common/enums'
import { ActivityLogService } from '../../common/activity-log.service'

@Controller('branch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(
    private branchesService: BranchesService,
    private activityLogs: ActivityLogService,
  ) {}

  @Get()
  async list(@CurrentUser() user: any) {
    return this.branchesService.list(user)
  }

  @Get('by-type')
  async byType(@CurrentUser() user: any, @Query('type') type: any) {
    return this.branchesService.listByType(user, type)
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async create(@CurrentUser() user: any, @Body() dto: CreateBranchDto, @Req() req: any) {
    const created = await this.branchesService.create(user, dto)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: created?.tenant?.id ?? user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'create_branch',
      description: `Created branch ${created?.name ?? dto.name}`,
      ipAddress,
    })
    return created
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateBranchDto, @Req() req: any) {
    const updated = await this.branchesService.update(user, id, dto)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: updated?.tenant?.id ?? user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'update_branch',
      description: `Updated branch ${updated?.name ?? id}`,
      ipAddress,
    })
    return updated
  }

  @Patch(':id/archive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async archive(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const archived = await this.branchesService.archive(user, id)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: archived?.tenant?.id ?? user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'archive_branch',
      description: `Archived branch ${archived?.name ?? id}`,
      ipAddress,
    })
    return archived
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async remove(@CurrentUser() user: any, @Param('id') id: string, @Req() req: any) {
    const result = await this.branchesService.remove(user, id)
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || 'system'
    await this.activityLogs.logEvent({
      tenantId: user?.tenant_id,
      userId: user?.user_id ?? user?.id,
      action: 'delete_branch',
      description: `Deleted branch ${id}`,
      ipAddress,
    })
    return result
  }
}
