import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Staging = 'staging',
  Test = 'test',
  Docker = 'docker',
}

enum DatabaseType {
  Postgres = 'postgres',
  Sqlite = 'sqlite',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsEnum(DatabaseType)
  @IsOptional()
  DATABASE_TYPE: DatabaseType = DatabaseType.Sqlite;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT = 8080;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Postgres)
  @IsString()
  DATABASE_HOST: string;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Postgres)
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Postgres)
  @IsString()
  DATABASE_USER: string;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Postgres)
  @IsString()
  DATABASE_PASSWORD: string;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Postgres)
  @IsString()
  DATABASE_NAME: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  DATABASE_SSL = false;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Sqlite)
  @IsString()
  DATABASE_PATH?: string;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE?: boolean;

  @IsString()
  @IsOptional()
  LOG_LEVEL = 'info';
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
