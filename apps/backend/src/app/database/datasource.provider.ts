
import { DataSource } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'loan-system',
        entities: [
          Client,
          Loan,
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
