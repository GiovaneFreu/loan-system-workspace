import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE } from '../../database/datasource.provider';
import { DataSource } from 'typeorm';
import { DashboardInterface } from '@loan-system-workspace/interfaces';
import { Client } from '../clients/entities/client.entity';
import { Loan } from '../loans/entities/loan.entity';

@Injectable()
export class DashboardService {
  @Inject(DATA_SOURCE) private readonly dataSource: DataSource

  async getDashboardData():Promise<DashboardInterface> {
    const clientsTotal = await this.dataSource.manager.count(Client)

    const loans = await this.dataSource.manager.find(Loan)
    const loansSum  = loans.reduce((acc, loan) => acc + loan.purchaseValue, 0)

    return {
      clientsTotal,
      loansQuantityTotal: loans.length,
      loansValueTotal: loansSum
    }
  }

}
