import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'
import { FuelPump } from './fuel-pump.entity'

@Entity({ name: 'fuel_reconciliations' })
export class ShiftReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.fuel_reconciliations, { onDelete: 'CASCADE' })
  branch!: Branch

  @ManyToOne(() => FuelPump, { nullable: true })
  pump?: FuelPump | null

  @Column({ type: 'int' })
  shift_number!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  start_reading!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  end_reading!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  sales_amount!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  variance!: number

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
