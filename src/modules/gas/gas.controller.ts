import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common'
import { GasService } from './gas.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateGasCylinderDto } from './dto/create-gas-cylinder.dto'
import { CreateGasTransactionDto } from './dto/create-gas-transaction.dto'
import { CreateGasExpenseDto } from './dto/create-gas-expense.dto'
import { UpdateGasTransactionDto } from './dto/update-gas-transaction.dto'

@Controller('gas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GasController {
  constructor(private gasService: GasService) {}

  @Get('branches')
  async branches(@CurrentUser() user: any) {
    return this.gasService.getBranches(user)
  }

  @Post('cylinders')
  async createCylinder(@CurrentUser() user: any, @Body() dto: CreateGasCylinderDto) {
    return this.gasService.createCylinder(user, dto)
  }

  @Get('cylinders/:branchId')
  async cylinders(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.gasService.listCylinders(user, branchId)
  }

  @Post('sales')
  async createSale(@CurrentUser() user: any, @Body() dto: CreateGasTransactionDto) {
    return this.gasService.createTransaction(user, dto)
  }

  @Get('sales/:branchId')
  async sales(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.gasService.listSales(user, branchId)
  }

  @Get('sales/my/:branchId')
  async mySales(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.gasService.listMySales(user, branchId)
  }

  @Patch('sales/:id')
  async updateSale(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateGasTransactionDto,
  ) {
    return this.gasService.updateSale(user, id, dto)
  }

  @Delete('sales/:id')
  async deleteSale(@CurrentUser() user: any, @Param('id') id: string) {
    return this.gasService.deleteSale(user, id)
  }

  @Post('expenses')
  async createExpense(@CurrentUser() user: any, @Body() dto: CreateGasExpenseDto) {
    return this.gasService.createExpense(user, dto)
  }

  @Get('expenses/:branchId')
  async expenses(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.gasService.listExpenses(user, branchId)
  }

  @Get('expenses')
  async allExpenses(@CurrentUser() user: any) {
    return this.gasService.listAllExpenses(user)
  }

  @Put('expenses/:id')
  async updateExpense(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateGasExpenseDto>,
  ) {
    return this.gasService.updateExpense(user, id, dto)
  }

  @Delete('expenses/:id')
  async deleteExpense(@CurrentUser() user: any, @Param('id') id: string) {
    return this.gasService.deleteExpense(user, id)
  }

  @Get('analytics/:branchId')
  async analytics(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.gasService.analytics(user, branchId)
  }
}
