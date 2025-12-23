
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Client } from '../modules/clients/entities/client.entity';
import { Loan } from '../modules/loans/entities/loan.entity';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      const databaseType = configService.get<'postgres' | 'sqlite'>(
        'DATABASE_TYPE',
        'sqlite'
      );

      const defaultSqlitePath = '/var/lib/data/data.db';

      const entities = [Client, Loan];
      const baseConfig: Pick<DataSourceOptions, 'entities'> = { entities };

      const dataSource =
        databaseType === 'sqlite'
          ? (() => {
              const databasePath =
                configService.get<string>('DATABASE_PATH') || defaultSqlitePath;

              const databaseDir = dirname(databasePath);
              if (!existsSync(databaseDir)) {
                mkdirSync(databaseDir, { recursive: true });
              }

              return new DataSource({
                type: 'sqlite',
                database: databasePath,
                synchronize: configService.get<boolean>('DATABASE_SYNCHRONIZE', true),
                ...baseConfig,
              });
            })()
          : new DataSource({
              type: 'postgres',
              host: configService.get<string>('DATABASE_HOST'),
              port: configService.get<number>('DATABASE_PORT'),
              username: configService.get<string>('DATABASE_USER'),
              password: configService.get<string>('DATABASE_PASSWORD'),
              database: configService.get<string>('DATABASE_NAME'),
              ssl: configService.get<boolean>('DATABASE_SSL')
                ? { rejectUnauthorized: false }
                : false,
              ...baseConfig,
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
