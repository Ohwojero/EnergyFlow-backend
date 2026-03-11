import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateFuelReconciliationDto {
  @IsString()
  branch_id!: string

  @IsString()
  pump_id!: string

  @IsNumber()
  shift_number!: number

  @IsNumber()
  start_reading!: number

  @IsNumber()
  end_reading!: number

  @IsNumber()
  sales_amount!: number

  @IsNumber()
  variance!: number

  @IsOptional()
  @IsString()
  sales_staff_name?: string

  @IsOptional()
  @IsString()
  created_at?: string
}
