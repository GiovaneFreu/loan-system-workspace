import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../../database/datasource.provider';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from './entities/loan.entity';

@Injectable()
export class LoansService {

  @Inject(DATA_SOURCE) private readonly dataSource: DataSource

  create(createLoanDto: CreateLoanDto) {
    return 'This action adds a new loan';
  }

  findAll() {
    return this.dataSource.manager.find(Loan)
  }

  findOne(id: number) {
    return `This action returns a #${id} loan`;
  }

  update(id: number, updateLoanDto: UpdateLoanDto) {
    return `This action updates a #${id} loan`;
  }

  remove(id: number) {
    return `This action removes a #${id} loan`;
  }
}
