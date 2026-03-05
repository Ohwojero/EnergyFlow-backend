import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateFuelReconciliationDto {
  @IsOptional()
  @IsString()
  branch_id?: string

  @IsOptional()
  @IsString()
  pump_id?: string

  @IsOptional()
  @IsNumber()
  shift_number?: number

  @IsOptional()
  @IsNumber()
  start_reading?: number

  @IsOptional()
  @IsNumber()
  end_reading?: number

  @IsOptional()
  @IsNumber()
  sales_amount?: number

  @IsOptional()
  @IsNumber()
  variance?: number

  @IsOptional()
  @IsString()
  sales_staff_name?: string
}
