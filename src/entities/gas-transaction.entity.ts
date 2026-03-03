import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Branch } from './branch.entity'

export enum GasTransactionType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  REFILL = 'refill',
}

@Entity({ name: 'gas_transactions' })
export class GasTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Branch, (branch: Branch) => branch.gas_transactions, { onDelete: 'CASCADE' })
  branch!: Branch

  @Column({ type: 'enum', enum: GasTransactionType })
  type!: GasTransactionType

  @Column({ type: 'varchar', length: 40 })
  cylinder_size!: string

  @Column({ type: 'int' })
  quantity!: number

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: number

  @Column({ type: 'varchar', length: 400, default: '' })
  notes!: string

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
