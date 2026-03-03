import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'

export enum FuelProductType {
  PMS = 'PMS',
  AGO = 'AGO',
  DPK = 'DPK',
}

@Entity({ name: 'fuel_products' })
export class FuelProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.fuel_products, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'enum', enum: FuelProductType })
  type!: FuelProductType

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  quantity!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  unit_price!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  total_value!: number
}
