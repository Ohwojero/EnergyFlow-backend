import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { TenantPlan } from '../../../common/enums'

export class RegisterDto {
  @IsString()
  business_name!: string

  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(TenantPlan)
  plan!: TenantPlan
}
