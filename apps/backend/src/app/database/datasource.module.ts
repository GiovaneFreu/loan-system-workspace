import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './datasource.provider';

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
