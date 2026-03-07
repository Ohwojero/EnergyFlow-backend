import { IsNumber, IsString, IsPositive, Min } from 'class-validator';

export class UpdateFuelTransferDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsString()
  staff_name: string;
}
