import { IsEnum, IsNumber, IsString } from 'class-validator'
import { FuelExpenseCategory } from '../../../entities/fuel-expense.entity'

export class CreateFuelExpenseDto {
  @IsString()
  branch_id!: string

  @IsEnum(FuelExpenseCategory)
  category!: FuelExpenseCategory

  @IsNumber()
  amount!: number

  @IsString()
  description!: string
}
