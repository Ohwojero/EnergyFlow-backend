import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'

@Entity({ name: 'gas_daily_activities' })
export class GasDailyActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.gas_daily_activities, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'date' })
  date!: string

  @Column({ type: 'jsonb' })
  pump_readings!: any

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  system_record_kg!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  sun_adjustment_kg!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total_kg!: number

  @Column({ type: 'jsonb' })
  payment_breakdown!: any

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
