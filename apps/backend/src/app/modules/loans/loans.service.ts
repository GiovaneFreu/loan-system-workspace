import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { DATA_SOURCE } from '../../database/datasource.provider';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { Loan } from './entities/loan.entity';
import { ClientInterface } from '@loan-system-workspace/interfaces';

@Injectable()
export class LoansService {
  private loanRepository: Repository<Loan>;

  constructor(
    @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
  ) {
    this.loanRepository = this.dataSource.getRepository(Loan);
  }

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const { client,currency, ...loanData } = createLoanDto;
    const loan = this.loanRepository.create({
      ...loanData,
      currencyType: currency.symbol,
      client: { id: client.id } as ClientInterface
    });
    return await this.loanRepository.save(loan);
  }

  async findAll(): Promise<Loan[]> {
    return await this.loanRepository.find({
      relations: ['client']
    });
  }

  async findOne(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['client']
    });

    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }

    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(id);
    Object.assign(loan, updateLoanDto);
    return await this.loanRepository.save(loan);
  }

  async remove(id: number): Promise<void> {
    const result = await this.loanRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
  }

  async findByClientId(clientId: number): Promise<Loan[]> {
    return await this.loanRepository.find({
      where: { client: { id: clientId } },
      relations: ['client']
    });
  }
}
