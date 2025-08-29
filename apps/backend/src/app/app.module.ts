import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/datasource.module';
import { ClientsModule } from './modules/clients/clients.module';
import { LoansModule } from './modules/loans/loans.module';
import { HealthModule } from './health/health.module';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `infrastructure/environments/.env.${
          process.env.NODE_ENV || 'development'
        }`,
        'infrastructure/environments/.env',
      ],
      validate: validateEnv,
    }),
    HealthModule,
    ClientsModule,
    DatabaseModule,
    DashboardModule,
    LoansModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'apps', 'frontend', 'browser'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
