import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { CentralBankService } from './central-bank.service';
import { CurrencyType } from '@loan-system-workspace/interfaces';

@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
    private readonly centralBankService: CentralBankService
  ) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  findAll() {
    return this.loansService.findAll();
  }

  @Get('exchange-rates')
  async getExchangeRates() {
    return await this.centralBankService.getAllExchangeRates();
  }

  @Get('exchange-rate/:currency')
  async getExchangeRate(@Param('currency') currency: CurrencyType) {
    const rate = await this.centralBankService.getExchangeRate(currency);
    return { currency, rate };
  }

  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.loansService.findByClientId(+clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(+id);
  }

  @Get(':id/calculate')
  async calculateLoanDetails(
    @Param('id') id: string,
    @Query('interestRate') interestRate?: string
  ) {
    const loan = await this.loansService.findOne(+id);
    const conversionRate = await this.centralBankService.getExchangeRate(loan.currencyType);
    const rate = interestRate ? parseFloat(interestRate) : 5;
    
    return this.loansService.calculateLoanDetails(loan, conversionRate, rate);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(+id, updateLoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loansService.remove(+id);
  }
}
