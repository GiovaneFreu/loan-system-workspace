import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { ClientInterface, CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';

@Controller('loans')
export class LoansController {
  constructor(
    private readonly loansService: LoansService,
  ) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  async findAll():Promise<LoanInterface[]> {
    const loans = await this.loansService.findAll();
    return loans.map((l)=>{
      const {currencyType,id,dueDate,client,purchaseDate,purchaseValue,finalAmount,interestRate,conversionRate,monthsCount} = l
      return {
       id,
        dueDate,
        client:{
         id: client.id,
          name:client.name
        } as ClientInterface,
        currency:{
         symbol:currencyType
        } as CurrencyInterface,
        purchaseDate,
        purchaseValue,
        finalAmount,
        interestRate,
        conversionRate,
        monthsCount: +monthsCount
      }
    })
  }


  @Get('client/:clientId')
  findByClientId(@Param('clientId') clientId: string) {
    return this.loansService.findByClientId(+clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(+id, updateLoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loansService.remove(+id);
  }
}
