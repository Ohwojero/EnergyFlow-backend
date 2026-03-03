import { IsEnum, IsNumber, IsString } from 'class-validator'
import { FuelProductType } from '../../../entities/fuel-product.entity'

export class CreateFuelProductDto {
  @IsString()
  branch_id!: string

  @IsEnum(FuelProductType)
  type!: FuelProductType

  @IsNumber()
  quantity!: number

  @IsNumber()
  unit_price!: number

  @IsNumber()
  total_value!: number
}
