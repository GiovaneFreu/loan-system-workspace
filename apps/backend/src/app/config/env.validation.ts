import { plainToInstance, Transform } from 'class-transformer';
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

const parseBoolean = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) {
    return false;
  }

  return value;
};

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

  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  @IsOptional()
  DATABASE_SSL = false;

  @ValidateIf((env) => env.DATABASE_TYPE === DatabaseType.Sqlite)
  @IsString()
  DATABASE_PATH?: string;

  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE?: boolean;

  @IsString()
  @IsOptional()
  HTTP2_TLS_KEY_PATH?: string;

  @IsString()
  @IsOptional()
  HTTP2_TLS_CERT_PATH?: string;

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
