import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Branch } from './branch.entity'
import { FuelProductType } from './fuel-product.entity'
import { FuelTankReading } from './fuel-tank-reading.entity'

@Entity({ name: 'fuel_tanks' })
export class FuelTank {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.fuel_tanks, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'varchar', length: 120 })
  name!: string

  @Column({ type: 'enum', enum: FuelProductType })
  product_type!: FuelProductType

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  capacity_litres!: number

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  current_volume_litres!: number

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string

  @OneToMany(() => FuelTankReading, (reading: FuelTankReading) => reading.tank)
  readings!: FuelTankReading[]

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date
}
