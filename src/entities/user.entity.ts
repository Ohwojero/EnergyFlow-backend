import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserRole, BranchType } from '../common/enums'
import { Tenant } from './tenant.entity'
import { Branch } from './branch.entity'

export enum BusinessType {
  GAS = 'gas',
  FUEL = 'fuel'
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 200, unique: true })
  email!: string

  @Column({ type: 'varchar', length: 200 })
  name!: string

  @Column({ type: 'varchar', length: 255 })
  password_hash!: string

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole

  @Column({ type: 'enum', enum: BranchType, array: true, default: '{}' })
  assigned_branch_types!: BranchType[]

  @Column({ type: 'enum', enum: BusinessType, nullable: true })
  business_type?: BusinessType

  @Column({ type: 'boolean', default: true })
  is_active!: boolean

  @ManyToOne(() => Tenant, (tenant: Tenant) => tenant.users, { onDelete: 'CASCADE' })
  tenant!: Tenant

  @ManyToMany(() => Branch, (branch: Branch) => branch.assigned_users)
  @JoinTable({ name: 'user_branches' })
  assigned_branches!: Branch[]

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date
}
