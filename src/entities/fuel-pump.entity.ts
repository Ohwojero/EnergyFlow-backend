import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'
import { FuelProductType } from './fuel-product.entity'

@Entity({ name: 'fuel_pumps' })
export class FuelPump {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.fuel_pumps, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'varchar', length: 40 })
  pump_number!: string

  @Column({ type: 'enum', enum: FuelProductType })
  product_type!: FuelProductType

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  current_reading!: number

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: string
}
