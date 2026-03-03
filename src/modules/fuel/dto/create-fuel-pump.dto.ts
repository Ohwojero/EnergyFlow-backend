import { IsEnum, IsNumber, IsString } from 'class-validator'
import { FuelProductType } from '../../../entities/fuel-product.entity'

export class CreateFuelPumpDto {
  @IsString()
  branch_id!: string

  @IsString()
  pump_number!: string

  @IsEnum(FuelProductType)
  product_type!: FuelProductType

  @IsNumber()
  current_reading!: number

  @IsString()
  status!: string
}
