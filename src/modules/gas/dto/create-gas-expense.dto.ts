import { IsEnum, IsNumber, IsString } from 'class-validator'
import { GasExpenseCategory } from '../../../entities/gas-expense.entity'

export class CreateGasExpenseDto {
  @IsString()
  branch_id!: string

  @IsEnum(GasExpenseCategory)
  category!: GasExpenseCategory

  @IsNumber()
  amount!: number

  @IsString()
  description!: string
}
