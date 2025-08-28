import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { CurrencyType } from '@loan-system-workspace/interfaces';

export class CreateLoanDto {
  @IsDateString()
  purchaseDate: Date;

  @IsEnum(CurrencyType)
  currencyType: CurrencyType;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  purchaseValue: number;

  @IsDateString()
  dueDate: Date;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  clientId: number;
}
