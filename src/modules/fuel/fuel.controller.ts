import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { FuelService } from './fuel.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateFuelProductDto } from './dto/create-fuel-product.dto'
import { CreateFuelPumpDto } from './dto/create-fuel-pump.dto'
import { CreateFuelReconciliationDto } from './dto/create-fuel-reconciliation.dto'
import { CreateFuelExpenseDto } from './dto/create-fuel-expense.dto'

@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelController {
  constructor(private fuelService: FuelService) {}

  @Get('branches')
  async branches(@CurrentUser() user: any) {
    return this.fuelService.getBranches(user)
  }

  @Post('products')
  async createProduct(@CurrentUser() user: any, @Body() dto: CreateFuelProductDto) {
    return this.fuelService.createProduct(user, dto)
  }

  @Get('products/:branchId')
  async products(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listProducts(user, branchId)
  }

  @Post('pumps')
  async createPump(@CurrentUser() user: any, @Body() dto: CreateFuelPumpDto) {
    return this.fuelService.createPump(user, dto)
  }

  @Get('pumps/:branchId')
  async pumps(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listPumps(user, branchId)
  }

  @Post('reconciliations')
  async createReconciliation(
    @CurrentUser() user: any,
    @Body() dto: CreateFuelReconciliationDto,
  ) {
    return this.fuelService.createReconciliation(user, dto)
  }

  @Get('reconciliations/:branchId')
  async reconciliations(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listReconciliations(user, branchId)
  }

  @Post('expenses')
  async createExpense(@CurrentUser() user: any, @Body() dto: CreateFuelExpenseDto) {
    return this.fuelService.createExpense(user, dto)
  }

  @Get('expenses/:branchId')
  async expenses(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listExpenses(user, branchId)
  }

  @Get('expenses')
  async allExpenses(@CurrentUser() user: any) {
    return this.fuelService.listAllExpenses(user)
  }

  @Get('analytics/:branchId')
  async analytics(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.analytics(user, branchId)
  }
}
