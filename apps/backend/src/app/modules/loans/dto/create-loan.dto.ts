import { IsDateString, IsNumber, IsPositive, ValidateNested, IsObject, IsString, IsOptional, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ClientInterface, CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';

class CurrencyDto implements CurrencyInterface {
  @IsString()
  name: string;

  @IsString()
  symbol: string;
}

class ClientDto implements ClientInterface {
  @IsNumber()
  @IsPositive()
  id: number;

  @IsString()
  name: string;

  @IsDateString()
  birthDate: Date;

  @IsString()
  cpf_cnpj: string;

  @IsNumber()
  @IsPositive()
  monthlyIncome: number;

  @IsOptional()
  @IsArray()
  loans?: LoanInterface[];
}

export class CreateLoanDto implements Omit<LoanInterface, 'id'> {
  @IsDateString()
  purchaseDate: Date;

  @IsObject()
  currency: CurrencyInterface;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  purchaseValue: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  interestRate: number;

  @IsDateString()
  dueDate: Date;

  @IsObject()
  client: ClientInterface;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  monthsCount: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  finalAmount: number;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  conversionRate: number;
}
