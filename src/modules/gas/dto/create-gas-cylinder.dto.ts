import { IsEnum, IsNumber, IsString } from 'class-validator'
import { GasCylinderStatus } from '../../../entities/gas-cylinder.entity'

export class CreateGasCylinderDto {
  @IsString()
  branch_id!: string

  @IsString()
  size!: string

  @IsEnum(GasCylinderStatus)
  status!: GasCylinderStatus

  @IsNumber()
  quantity!: number

  @IsNumber()
  purchase_price!: number

  @IsNumber()
  selling_price!: number
}
