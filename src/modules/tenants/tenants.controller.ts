import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { Roles } from '../../common/roles.decorator'
import { UserRole, TenantStatus } from '../../common/enums'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { ChangePlanDto } from './dto/change-plan.dto'

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  async list() {
    return this.tenantsService.list()
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.tenantsService.getById(id)
  }

  @Put(':id/suspend')
  async suspend(@Param('id') id: string) {
    return this.tenantsService.updateStatus(id, TenantStatus.SUSPENDED)
  }

  @Put(':id/activate')
  async activate(@Param('id') id: string) {
    return this.tenantsService.updateStatus(id, TenantStatus.ACTIVE)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.updateDetails(id, dto)
  }

  @Put(':id/plan')
  async changePlan(@Param('id') id: string, @Body() dto: ChangePlanDto) {
    return this.tenantsService.changePlan(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tenantsService.delete(id)
  }
}
