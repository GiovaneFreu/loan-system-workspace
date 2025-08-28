import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/datasource.module';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { LoanCalculationsService } from './loan-calculations.service';
import { CentralBankService } from './central-bank.service';

@Module({
  imports:[DatabaseModule],
  controllers: [LoansController],
  providers: [LoansService, LoanCalculationsService, CentralBankService],
  exports: [CentralBankService],
})
export class LoansModule {}
