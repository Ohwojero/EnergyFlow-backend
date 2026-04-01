import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FuelController } from './fuel.controller'
import { FuelService } from './fuel.service'
import { Branch } from '../../entities/branch.entity'
import { FuelProduct } from '../../entities/fuel-product.entity'
import { FuelPump } from '../../entities/fuel-pump.entity'
import { ShiftReconciliation } from '../../entities/shift-reconciliation.entity'
import { FuelExpense } from '../../entities/fuel-expense.entity'
import { FuelTank } from '../../entities/fuel-tank.entity'
import { FuelTankReading } from '../../entities/fuel-tank-reading.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Branch, FuelProduct, FuelPump, ShiftReconciliation, FuelExpense, FuelTank, FuelTankReading])],
  controllers: [FuelController],
  providers: [FuelService],
})
export class FuelModule {}
