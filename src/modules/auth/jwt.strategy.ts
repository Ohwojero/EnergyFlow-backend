import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-secret',
    })
  }

  async validate(payload: any) {
    const user = payload?.sub
      ? await this.usersRepo.findOne({
          where: { id: payload.sub },
          relations: ['tenant'],
        })
      : null
    const tenantId = user?.tenant?.id ?? (payload.tenant_id as string | undefined)

    return {
      user_id: payload.sub,
      id: payload.sub,
      role: user?.role ?? payload.role,
      name: user?.name,
      tenant_id: tenantId,
    }
  }
}
