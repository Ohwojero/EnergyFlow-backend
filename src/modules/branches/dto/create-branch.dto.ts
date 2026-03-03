import { IsEnum, IsOptional, IsString } from 'class-validator'
import { BranchType } from '../../../common/enums'

export class CreateBranchDto {
  @IsString()
  name!: string

  @IsEnum(BranchType)
  type!: BranchType

  @IsString()
  location!: string

  @IsString()
  manager_name!: string

  @IsOptional()
  @IsString()
  tenant_id?: string

  @IsOptional()
  @IsString()
  manager_id?: string
}
