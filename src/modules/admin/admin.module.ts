import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { Tenant } from '../../entities/tenant.entity'
import { ActivityLog } from '../../entities/activity-log.entity'
import { Invoice } from '../../entities/invoice.entity'
import { User } from '../../entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, ActivityLog, Invoice, User])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
