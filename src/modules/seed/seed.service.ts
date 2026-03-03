import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import bcrypt from 'bcryptjs'
import { Tenant } from '../../entities/tenant.entity'
import { User } from '../../entities/user.entity'
import { TenantPlan, TenantStatus, UserRole } from '../../common/enums'

@Injectable()
export class SeedService implements OnModuleInit {
  private logger = new Logger(SeedService.name)

  constructor(
    private config: ConfigService,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const shouldSeed = this.config.get<string>('SEED_ADMIN') === 'true'
    if (!shouldSeed) return

    const adminEmail = this.config.get<string>('SEED_ADMIN_EMAIL') ?? 'admin@energyflow.com'
    const password = this.config.get<string>('SEED_ADMIN_PASSWORD') ?? 'Admin123!'
    const existing = await this.usersRepo.findOne({
      where: { email: adminEmail },
      relations: ['tenant'],
    })

    if (existing) {
      existing.password_hash = await bcrypt.hash(password, 10)
      existing.role = UserRole.SUPER_ADMIN
      existing.is_active = true

      if (!existing.tenant) {
        const tenant = this.tenantsRepo.create({
          name: 'EnergyFlow Admin',
          subscription_plan: TenantPlan.ORGANISATION,
          status: TenantStatus.ACTIVE,
          branch_types: [],
          owner_name: existing.name || 'System Admin',
          owner_email: adminEmail,
          last_active: new Date(),
        })
        existing.tenant = await this.tenantsRepo.save(tenant)
      }

      await this.usersRepo.save(existing)
      this.logger.log(`Updated super_admin and reset password: ${adminEmail}`)
      return
    }

    const tenant = this.tenantsRepo.create({
      name: 'EnergyFlow Admin',
      subscription_plan: TenantPlan.ORGANISATION,
      status: TenantStatus.ACTIVE,
      branch_types: [],
      owner_name: 'System Admin',
      owner_email: adminEmail,
      last_active: new Date(),
    })
    await this.tenantsRepo.save(tenant)

    const password_hash = await bcrypt.hash(password, 10)
    const user = this.usersRepo.create({
      email: adminEmail,
      name: 'Admin User',
      role: UserRole.SUPER_ADMIN,
      password_hash,
      tenant,
      assigned_branch_types: [],
      assigned_branches: [],
      is_active: true,
    })
    await this.usersRepo.save(user)
    this.logger.log(`Seeded super_admin: ${adminEmail}`)
  }
}
