import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateFuelTransferDto {
  @IsUUID()
  @IsNotEmpty()
  branch_id: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  staff_name: string;
}
