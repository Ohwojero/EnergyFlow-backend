import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { FuelService } from './fuel.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { RolesGuard } from '../../common/roles.guard'
import { CurrentUser } from '../../common/current-user.decorator'
import { CreateFuelProductDto } from './dto/create-fuel-product.dto'
import { CreateFuelPumpDto } from './dto/create-fuel-pump.dto'
import { CreateFuelReconciliationDto } from './dto/create-fuel-reconciliation.dto'
import { CreateFuelExpenseDto } from './dto/create-fuel-expense.dto'
import { UpdateFuelReconciliationDto } from './dto/update-fuel-reconciliation.dto'
import { CreateFuelTankDto } from './dto/create-fuel-tank.dto'
import { UpdateFuelTankDto } from './dto/update-fuel-tank.dto'
import { CreateFuelTankReadingDto } from './dto/create-fuel-tank-reading.dto'

@Controller('fuel')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FuelController {
  constructor(private fuelService: FuelService) {}

  @Get('branches')
  async branches(@CurrentUser() user: any) {
    return this.fuelService.getBranches(user)
  }

  @Get('debug/reconciliations')
  async debugReconciliations(@CurrentUser() user: any) {
    return this.fuelService.debugReconciliations(user)
  }

  @Get('debug/my-reconciliations/:branchId')
  async debugMyReconciliations(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    console.log('=== DEBUG MY RECONCILIATIONS ===')
    console.log('User:', user)
    console.log('Branch ID:', branchId)
    const result = await this.fuelService.listMyReconciliations(user, branchId)
    console.log('Result:', result)
    return {
      user_info: {
        id: user?.id,
        user_id: user?.user_id,
        role: user?.role,
        name: user?.name
      },
      branch_id: branchId,
      reconciliations: result
    }
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

  @Post('tanks')
  async createTank(@CurrentUser() user: any, @Body() dto: CreateFuelTankDto) {
    return this.fuelService.createTank(user, dto)
  }

  @Get('tanks/:branchId')
  async tanks(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listTanks(user, branchId)
  }

  @Put('tanks/:id')
  async updateTank(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateFuelTankDto) {
    return this.fuelService.updateTank(user, id, dto)
  }

  @Post('tank-readings')
  async createTankReading(@CurrentUser() user: any, @Body() dto: CreateFuelTankReadingDto) {
    return this.fuelService.createTankReading(user, dto)
  }

  @Get('tank-readings/branch/:branchId')
  async tankReadings(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listTankReadingsByBranch(user, branchId)
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

  @Get('reconciliations/my/:branchId')
  async myReconciliations(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.listMyReconciliations(user, branchId)
  }

  @Put('reconciliations/:id')
  async updateReconciliation(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateFuelReconciliationDto,
  ) {
    return this.fuelService.updateReconciliation(user, id, dto)
  }

  @Delete('reconciliations/:id')
  async deleteReconciliation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.fuelService.deleteReconciliation(user, id)
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

  @Put('expenses/:id')
  async updateExpense(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateFuelExpenseDto,
  ) {
    return this.fuelService.updateExpense(user, id, dto)
  }

  @Delete('expenses/:id')
  async deleteExpense(@CurrentUser() user: any, @Param('id') id: string) {
    return this.fuelService.deleteExpense(user, id)
  }

  @Get('analytics/:branchId')
  async analytics(@CurrentUser() user: any, @Param('branchId') branchId: string) {
    return this.fuelService.analytics(user, branchId)
  }
}
