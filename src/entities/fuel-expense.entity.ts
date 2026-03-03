import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'

export enum FuelExpenseCategory {
  PUMP_MAINTENANCE = 'pump_maintenance',
  TANK_CLEANING = 'tank_cleaning',
  FILTER_REPLACEMENT = 'filter_replacement',
  OTHER = 'other',
}

@Entity({ name: 'fuel_expenses' })
export class FuelExpense {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.fuel_expenses, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'enum', enum: FuelExpenseCategory })
  category!: FuelExpenseCategory

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: number

  @Column({ type: 'varchar', length: 400 })
  description!: string

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
