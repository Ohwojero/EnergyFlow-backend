import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SeedService } from './seed.service'
import { Tenant } from '../../entities/tenant.entity'
import { User } from '../../entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User])],
  providers: [SeedService],
})
export class SeedModule {}
