import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BranchesController } from './branches.controller'
import { BranchesService } from './branches.service'
import { Branch } from '../../entities/branch.entity'
import { Tenant } from '../../entities/tenant.entity'
import { User } from '../../entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Tenant, User])],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
