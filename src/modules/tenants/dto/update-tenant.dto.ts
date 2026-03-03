import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator'
import { BranchType } from '../../../common/enums'

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  owner_name?: string

  @IsOptional()
  @IsEmail()
  owner_email?: string

  @IsOptional()
  @IsArray()
  branch_types?: BranchType[]
}
