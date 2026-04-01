import 'reflect-metadata'
import { config as loadEnv } from 'dotenv'
import { DataSource } from 'typeorm'
import { ActivityLog } from '../entities/activity-log.entity'
import { Branch } from '../entities/branch.entity'
import { FuelExpense } from '../entities/fuel-expense.entity'
import { FuelProduct } from '../entities/fuel-product.entity'
import { FuelPump } from '../entities/fuel-pump.entity'
import { FuelTank } from '../entities/fuel-tank.entity'
import { FuelTankReading } from '../entities/fuel-tank-reading.entity'
import { GasCylinder } from '../entities/gas-cylinder.entity'
import { GasDailyActivity } from '../entities/gas-daily-activity.entity'
import { GasExpense } from '../entities/gas-expense.entity'
import { GasTransaction } from '../entities/gas-transaction.entity'
import { Invoice } from '../entities/invoice.entity'
import { ShiftReconciliation } from '../entities/shift-reconciliation.entity'
import { Tenant } from '../entities/tenant.entity'
import { User } from '../entities/user.entity'

loadEnv()

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  host: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL ? undefined : process.env.DB_HOST ?? 'localhost',
  port: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL ? undefined : Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL ? undefined : process.env.DB_USER ?? 'postgres',
  password: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL ? undefined : process.env.DB_PASS ?? 'postgres',
  database: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL ? undefined : process.env.DB_NAME ?? 'energyflow',
  synchronize: false,
  logging: process.env.DB_LOG === 'true',
  entities: [
    ActivityLog,
    Branch,
    FuelExpense,
    FuelProduct,
    FuelPump,
    FuelTank,
    FuelTankReading,
    GasCylinder,
    GasDailyActivity,
    GasExpense,
    GasTransaction,
    Invoice,
    ShiftReconciliation,
    Tenant,
    User,
  ],
  migrations: ['src/database/migrations/*{.ts,.js}'],
})

export default dataSource
