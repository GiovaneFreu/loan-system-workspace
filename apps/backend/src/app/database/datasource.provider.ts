
import { DataSource } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';
import {env} from 'node:process'

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: env.DATABASE_HOST,
        port: parseInt(env.DATABASE_PORT),
        username: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        database: env.DATABASE_NAME,
        entities: [
          Client,
          Loan,
        ],
        synchronize: true,
        ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });

      const maxRetries = 5;
      const retryDelay = 5000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await dataSource.initialize();
          console.log('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error.message);

          if (attempt === maxRetries) {
            console.error('Max retries reached. Database connection failed permanently.');
            throw error;
          }

          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    },
  },
];
