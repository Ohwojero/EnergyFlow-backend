import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Branch } from './branch.entity'

export enum GasCylinderStatus {
  IN_STOCK = 'in_stock',
  REFILLING = 'refilling',
  DAMAGED = 'damaged',
}

@Entity({ name: 'gas_cylinders' })
export class GasCylinder {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.gas_cylinders, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'varchar', length: 40 })
  size!: string

  @Column({ type: 'enum', enum: GasCylinderStatus })
  status!: GasCylinderStatus

  @Column({ type: 'int' })
  quantity!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  purchase_price!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  selling_price!: number

  @UpdateDateColumn({ type: 'timestamptz' })
  last_updated!: Date
}
