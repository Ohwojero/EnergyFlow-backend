import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { BranchesService } from './branches.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateBranchDto } from './dto/create-branch.dto'
import { UpdateBranchDto } from './dto/update-branch.dto'
import { Roles } from '../../common/roles.decorator'
import { UserRole } from '../../common/enums'

@Controller('branch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

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
  async create(@CurrentUser() user: any, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(user, dto)
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(user, id, dto)
  }

  @Patch(':id/archive')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async archive(@CurrentUser() user: any, @Param('id') id: string) {
    return this.branchesService.archive(user, id)
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.branchesService.remove(user, id)
  }
}
