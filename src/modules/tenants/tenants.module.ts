import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TenantsController } from './tenants.controller'
import { TenantsService } from './tenants.service'
import { Tenant } from '../../entities/tenant.entity'
import { User } from '../../entities/user.entity'
import { Branch } from '../../entities/branch.entity'
import { Invoice } from '../../entities/invoice.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User, Branch, Invoice])],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
