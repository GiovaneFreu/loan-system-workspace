
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          Client,
          Loan,
        ],
        synchronize: true,
        ssl: configService.get<boolean>('DATABASE_SSL') ? { rejectUnauthorized: false } : false,
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
    inject: [ConfigService],
  },
];
