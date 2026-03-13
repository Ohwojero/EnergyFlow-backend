import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User } from '../../entities/user.entity'
import { Tenant } from '../../entities/tenant.entity'
import { Branch } from '../../entities/branch.entity'
import { ActivityLogModule } from '../../common/activity-log.module'

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, Branch]), ActivityLogModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
