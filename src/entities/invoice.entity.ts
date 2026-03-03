import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Tenant } from './tenant.entity'
import { TenantPlan } from '../common/enums'

export enum InvoiceStatus {
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.invoices, { onDelete: 'CASCADE' })
  tenant!: Tenant

  @Column({ type: 'varchar', length: 40, unique: true })
  invoice_number!: string

  @Column({ type: 'enum', enum: TenantPlan })
  plan_type!: TenantPlan

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount!: number

  @Column({ type: 'date' })
  payment_date!: string

  @Column({ type: 'enum', enum: InvoiceStatus })
  status!: InvoiceStatus

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date
}
