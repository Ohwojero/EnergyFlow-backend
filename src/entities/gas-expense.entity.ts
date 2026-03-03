import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'

export enum GasExpenseCategory {
  CYLINDER_REPAIR = 'cylinder_repair',
  SAFETY_INSPECTION = 'safety_inspection',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

@Entity({ name: 'gas_expenses' })
export class GasExpense {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.gas_expenses, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'enum', enum: GasExpenseCategory })
  category!: GasExpenseCategory

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: number

  @Column({ type: 'varchar', length: 400 })
  description!: string

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
