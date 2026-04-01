import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class CreateFuelTankReadingDto {
  @IsString()
  tank_id!: string

  @IsDateString()
  reading_date!: string

  @IsNumber()
  @Min(0)
  opening_volume_litres!: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveries_litres?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  transfers_out_litres?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  sales_litres?: number

  @IsNumber()
  @Min(0)
  actual_closing_litres!: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  dip_reading_litres?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  sensor_volume_litres?: number

  @IsOptional()
  @IsString()
  notes?: string
}
