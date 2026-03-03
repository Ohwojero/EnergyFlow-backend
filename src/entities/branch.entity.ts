import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { BranchType } from '../common/enums'
import { Tenant } from './tenant.entity'
import { User } from './user.entity'
import { GasCylinder } from './gas-cylinder.entity'
import { GasTransaction } from './gas-transaction.entity'
import { GasDailyActivity } from './gas-daily-activity.entity'
import { FuelProduct } from './fuel-product.entity'
import { FuelPump } from './fuel-pump.entity'
import { ShiftReconciliation } from './shift-reconciliation.entity'
import { FuelExpense } from './fuel-expense.entity'
import { GasExpense } from './gas-expense.entity'

@Entity({ name: 'branches' })
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.branches, { onDelete: 'CASCADE' })
  tenant!: Tenant

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'enum', enum: BranchType })
  type!: BranchType

  @Column({ type: 'varchar', length: 200 })
  location!: string

  @Column({ type: 'varchar', length: 200, default: 'Unassigned' })
  manager_name!: string

  @Column({ type: 'varchar', length: 40, default: 'active' })
  status!: string

  @ManyToOne(() => User, { nullable: true })
  manager?: User | null

  @ManyToMany(() => User, (user: User) => user.assigned_branches)
  assigned_users!: User[]

  @OneToMany(() => GasCylinder, (cyl: GasCylinder) => cyl.branch)
  gas_cylinders!: GasCylinder[]

  @OneToMany(() => GasTransaction, (tx: GasTransaction) => tx.branch)
  gas_transactions!: GasTransaction[]

  @OneToMany(() => GasDailyActivity, (activity: GasDailyActivity) => activity.branch)
  gas_daily_activities!: GasDailyActivity[]

  @OneToMany(() => GasExpense, (expense: GasExpense) => expense.branch)
  gas_expenses!: GasExpense[]

  @OneToMany(() => FuelProduct, (product: FuelProduct) => product.branch)
  fuel_products!: FuelProduct[]

  @OneToMany(() => FuelPump, (pump: FuelPump) => pump.branch)
  fuel_pumps!: FuelPump[]

  @OneToMany(() => ShiftReconciliation, (shift: ShiftReconciliation) => shift.branch)
  fuel_reconciliations!: ShiftReconciliation[]

  @OneToMany(() => FuelExpense, (expense: FuelExpense) => expense.branch)
  fuel_expenses!: FuelExpense[]

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date
}
