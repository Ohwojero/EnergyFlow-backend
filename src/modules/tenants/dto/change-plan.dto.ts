import { IsEnum } from 'class-validator'
import { TenantPlan } from '../../../common/enums'

export class ChangePlanDto {
  @IsEnum(TenantPlan)
  plan!: TenantPlan
}
