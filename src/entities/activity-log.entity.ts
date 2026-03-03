import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Tenant } from './tenant.entity'
import { User } from './user.entity'

@Entity({ name: 'activity_logs' })
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.activity_logs, { onDelete: 'CASCADE' })
  tenant!: Tenant

  @ManyToOne(() => User, { nullable: true })
  user?: User | null

  @Column({ type: 'varchar', length: 120 })
  action!: string

  @Column({ type: 'varchar', length: 400 })
  description!: string

  @Column({ type: 'varchar', length: 80, default: 'system' })
  ip_address!: string

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp!: Date
}
