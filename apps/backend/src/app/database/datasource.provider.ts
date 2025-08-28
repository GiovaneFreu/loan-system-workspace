
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
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'loan-system',
        entities: [
          Client,
          Loan,
        ],
        synchronize: true,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
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
