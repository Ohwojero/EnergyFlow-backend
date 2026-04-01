import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { FuelProductType } from '../../../entities/fuel-product.entity'

export class UpdateFuelTankDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsEnum(FuelProductType)
  product_type?: FuelProductType

  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity_litres?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_volume_litres?: number

  @IsOptional()
  @IsString()
  status?: string
}
