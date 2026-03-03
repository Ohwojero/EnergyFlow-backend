import { IsIn, IsOptional, IsString } from 'class-validator'

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  manager_name?: string

  @IsOptional()
  @IsString()
  manager_id?: string

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive'
}
