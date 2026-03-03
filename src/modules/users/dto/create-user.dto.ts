import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { BranchType, UserRole } from '../../../common/enums'

export class CreateUserDto {
  @IsString()
  name!: string

  @IsEmail()
  email!: string

  @IsString()
  @MinLength(6)
  password!: string

  @IsEnum(UserRole)
  role!: UserRole

  @IsOptional()
  @IsString()
  tenant_id?: string

  @IsOptional()
  @IsArray()
  branch_ids?: string[]

  @IsOptional()
  @IsArray()
  assigned_branch_types?: BranchType[]
}
