import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { GasController } from './gas.controller'
import { GasService } from './gas.service'
import { Branch } from '../../entities/branch.entity'
import { GasCylinder } from '../../entities/gas-cylinder.entity'
import { GasTransaction } from '../../entities/gas-transaction.entity'
import { GasDailyActivity } from '../../entities/gas-daily-activity.entity'
import { GasExpense } from '../../entities/gas-expense.entity'
import { Tenant } from '../../entities/tenant.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Tenant, GasCylinder, GasTransaction, GasDailyActivity, GasExpense])],
  controllers: [GasController],
  providers: [GasService],
})
export class GasModule {}
