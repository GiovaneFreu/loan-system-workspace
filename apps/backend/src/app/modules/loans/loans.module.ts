import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/datasource.module';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

@Module({
  imports:[DatabaseModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [],
})
export class LoansModule {}
