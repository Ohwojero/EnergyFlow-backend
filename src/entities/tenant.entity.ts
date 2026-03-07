import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { TenantPlan, TenantStatus, BranchType } from '../common/enums'
import { User } from './user.entity'
import { Branch } from './branch.entity'
import { ActivityLog } from './activity-log.entity'
import { Invoice } from './invoice.entity'

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'enum', enum: TenantPlan })
  subscription_plan!: TenantPlan

  @Column({ type: 'varchar', length: 200, default: '' })
  owner_name!: string

  @Column({ type: 'varchar', length: 200, default: '' })
  owner_email!: string

  @Column({ type: 'enum', enum: TenantStatus, default: TenantStatus.ACTIVE })
  status!: TenantStatus

  @Column({ type: 'enum', enum: BranchType, array: true, default: '{}' })
  branch_types!: BranchType[]

  @Column({ type: 'timestamptz', nullable: true })
  last_active?: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  billing_cycle_start?: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  last_payment_date?: Date | null

  @Column({ type: 'boolean', default: false })
  payment_reminder_sent!: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date

  @OneToMany(() => User, (user: User) => user.tenant)
  users!: User[]

  @OneToMany(() => Branch, (branch: Branch) => branch.tenant)
  branches!: Branch[]

  @OneToMany(() => ActivityLog, (log: ActivityLog) => log.tenant)
  activity_logs!: ActivityLog[]

  @OneToMany(() => Invoice, (invoice: Invoice) => invoice.tenant)
  invoices!: Invoice[]
}
