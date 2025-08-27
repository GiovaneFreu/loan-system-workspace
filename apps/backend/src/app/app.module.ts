import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseModule } from './database/datasource.module';
import { ClientsModule } from './modules/clients/clients.module';
import { LoansModule } from './modules/loans/loans.module';

@Module({
  imports: [
    ClientsModule,
    DatabaseModule,
    LoansModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'apps', 'frontend', 'browser'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
