import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
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

  @Column({ type: 'varchar', length: 200, default: 'Unassigned' })
  sales_staff_name!: string

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id?: string | null

  @Column({ type: 'varchar', length: 40, nullable: true })
  created_by_role?: string | null

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date
}
