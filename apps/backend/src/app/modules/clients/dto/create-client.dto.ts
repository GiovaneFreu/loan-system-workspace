import { IsString, IsNotEmpty, IsDateString, IsNumber, IsPositive, Length } from 'class-validator';
import { Transform } from 'class-transformer';

//TODO - IMPLEMENTAR DEMAIS REGRAS
export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 200)
  name: string;

  @IsDateString()
  birthDate: Date;

  @IsString()
  @IsNotEmpty()
  @Length(11, 14)
  cpf_cnpj: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  monthlyIncome: number;
}
