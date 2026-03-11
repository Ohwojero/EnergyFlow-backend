import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { GasTransactionType } from '../../../entities/gas-transaction.entity'

export class CreateGasTransactionDto {
  @IsString()
  branch_id!: string

  @IsEnum(GasTransactionType)
  type!: GasTransactionType

  @IsString()
  cylinder_size!: string

  @IsNumber()
  quantity!: number

  @IsNumber()
  amount!: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  created_at?: string
}
