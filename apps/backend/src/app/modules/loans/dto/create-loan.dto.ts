import { IsDateString, IsNumber, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
import { ClientInterface, CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';

//TODO - REVISAR VALIDACAO
export class CreateLoanDto implements Omit<LoanInterface, 'id'> {
  @IsDateString()
  purchaseDate: Date;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  purchaseValue: number;

  @IsDateString()
  dueDate: Date;

  currency: CurrencyInterface;
  client: ClientInterface;
  finalAmount: number;
  monthsCount: number;
  interestRate: number;
  conversionRate: number;

}
