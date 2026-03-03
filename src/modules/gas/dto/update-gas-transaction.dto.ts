import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateGasTransactionDto {
  @IsOptional()
  @IsString()
  cylinder_size?: string

  @IsOptional()
  @IsNumber()
  quantity?: number

  @IsOptional()
  @IsNumber()
  amount?: number

  @IsOptional()
  @IsString()
  notes?: string
}
