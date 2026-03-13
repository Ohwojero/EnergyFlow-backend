import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { TenantPlan } from '../../../common/enums'

export enum BusinessType {
  GAS = 'gas',
  FUEL = 'fuel'
}

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

  @IsOptional()
  @IsEnum(BusinessType)
  business_type?: BusinessType
}
