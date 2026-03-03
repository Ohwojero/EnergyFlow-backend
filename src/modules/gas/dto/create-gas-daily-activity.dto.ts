import { IsArray, IsDateString, IsNumber, IsObject, IsString } from 'class-validator'

export class CreateGasDailyActivityDto {
  @IsString()
  branch_id!: string

  @IsDateString()
  date!: string

  @IsArray()
  pump_readings!: any[]

  @IsNumber()
  system_record_kg!: number

  @IsNumber()
  sun_adjustment_kg!: number

  @IsNumber()
  total_kg!: number

  @IsObject()
  payment_breakdown!: any
}
