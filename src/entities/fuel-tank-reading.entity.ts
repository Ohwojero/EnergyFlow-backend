import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FuelTank } from './fuel-tank.entity'

@Entity({ name: 'fuel_tank_readings' })
export class FuelTankReading {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => FuelTank, (tank: FuelTank) => tank.readings, { onDelete: 'CASCADE' })
  tank!: FuelTank

  @Column({ type: 'date' })
  reading_date!: string

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  opening_volume_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  deliveries_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  transfers_out_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  sales_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  expected_closing_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  actual_closing_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  variance_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  dip_reading_litres!: number | null

  @Column({ type: 'numeric', precision: 14, scale: 2, nullable: true })
  sensor_volume_litres!: number | null

  @Column({ type: 'varchar', length: 200, nullable: true })
  recorded_by_name!: string | null

  @Column({ type: 'varchar', length: 500, default: '' })
  notes!: string

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
