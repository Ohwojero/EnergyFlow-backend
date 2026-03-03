import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../../common/roles.decorator'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserRole } from '../../common/enums'

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    return this.usersService.listForUser(user)
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async create(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.usersService.create(user, dto)
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ORG_OWNER, UserRole.GAS_MANAGER, UserRole.FUEL_MANAGER)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.remove(user, id)
  }
}
