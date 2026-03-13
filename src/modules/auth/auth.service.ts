import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import bcrypt from 'bcryptjs'
import { User } from '../../entities/user.entity'
import { Tenant } from '../../entities/tenant.entity'
import { Branch } from '../../entities/branch.entity'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { TenantPlan, TenantStatus, UserRole } from '../../common/enums'

@Injectable()
export class AuthService {
  private branchSchemaChecked = false

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Tenant) private tenantsRepo: Repository<Tenant>,
    @InjectRepository(Branch) private branchesRepo: Repository<Branch>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    await this.ensureBranchSchema()
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['tenant', 'assigned_branches'],
    })
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const valid = await bcrypt.compare(dto.password, user.password_hash)
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials')
    }
    if (user.tenant) {
      user.tenant.last_active = new Date()
      await this.tenantsRepo.save(user.tenant)
    }
    return this.issueTokens(user)
  }

  async register(dto: RegisterDto) {
    await this.ensureBranchSchema()
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } })
    if (existing) {
      throw new BadRequestException('Email already in use')
    }

    const tenant = this.tenantsRepo.create({
      name: dto.business_name,
      subscription_plan: dto.plan ?? TenantPlan.ORGANISATION,
      status: TenantStatus.ACTIVE,
      branch_types: [],
      owner_name: dto.name,
      owner_email: dto.email,
      last_active: new Date(),
    })
    await this.tenantsRepo.save(tenant)

    const password_hash = await bcrypt.hash(dto.password, 10)
    const user = this.usersRepo.create({
      email: dto.email,
      name: dto.name,
      role: UserRole.ORG_OWNER,
      password_hash,
      tenant,
      assigned_branch_types: [],
      assigned_branches: [],
      business_type: dto.business_type,
      is_active: true,
    })
    await this.usersRepo.save(user)

    const loaded = await this.usersRepo.findOne({
      where: { id: user.id },
      relations: ['tenant', 'assigned_branches'],
    })
    if (!loaded) {
      throw new BadRequestException('Registration failed')
    }
    return this.issueTokens(loaded)
  }

  async profile(userId: string) {
    await this.ensureBranchSchema()
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['tenant', 'assigned_branches'],
    })
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return { user: this.toSafeUser(user) }
  }

  async refresh(refreshToken?: string) {
    await this.ensureBranchSchema()
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token')
    }
    try {
      const secret = this.config.get<string>('JWT_REFRESH_SECRET') ?? this.config.get<string>('JWT_SECRET') ?? 'dev-secret'
      const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, { secret })
      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
        relations: ['tenant', 'assigned_branches'],
      })
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      return this.issueTokens(user, false)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  private issueTokens(user: User, includeRefresh = true) {
    const payload = {
      sub: user.id,
      role: user.role,
      tenant_id: user.tenant?.id,
    }
    const access_token = this.jwt.sign(payload)
    let refresh_token: string | undefined
    if (includeRefresh) {
      const secret = this.config.get<string>('JWT_REFRESH_SECRET') ?? this.config.get<string>('JWT_SECRET') ?? 'dev-secret'
      const expiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'
      refresh_token = this.jwt.sign(payload, { secret, expiresIn: expiresIn as any })
    }
    return {
      access_token,
      refresh_token,
      user: this.toSafeUser(user),
    }
  }

  private toSafeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant?.id,
      tenant_name: user.tenant?.name ?? '',
      subscription_plan: user.tenant?.subscription_plan,
      tenant_branch_types: user.tenant?.branch_types ?? [],
      assigned_branches: user.assigned_branches?.map((b) => b.id) ?? [],
      assigned_branch_types: user.assigned_branch_types ?? [],
      business_type: user.business_type,
      created_at: user.created_at,
    }
  }

  private async ensureBranchSchema() {
    if (this.branchSchemaChecked) return
    await this.usersRepo.query(
      `ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "manager_name" character varying(200) NOT NULL DEFAULT 'Unassigned'`,
    )
    this.branchSchemaChecked = true
  }
}
