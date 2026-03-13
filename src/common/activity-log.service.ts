import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ActivityLog } from '../entities/activity-log.entity'

type ActivityLogInput = {
  tenantId?: string | null
  userId?: string | null
  action: string
  description: string
  ipAddress?: string
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog) private logsRepo: Repository<ActivityLog>,
  ) {}

  async logEvent(input: ActivityLogInput) {
    if (!input.tenantId) return
    const log = this.logsRepo.create({
      action: input.action,
      description: input.description,
      ip_address: input.ipAddress ?? 'system',
      tenant: { id: input.tenantId } as any,
      user: input.userId ? ({ id: input.userId } as any) : null,
    })
    await this.logsRepo.save(log)
  }
}
