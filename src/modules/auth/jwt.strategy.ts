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
    let tenantId = payload.tenant_id as string | undefined
    if (!tenantId && payload?.sub) {
      const user = await this.usersRepo.findOne({
        where: { id: payload.sub },
        relations: ['tenant'],
      })
      tenantId = user?.tenant?.id
    }

    return {
      user_id: payload.sub,
      role: payload.role,
      tenant_id: tenantId,
    }
  }
}
