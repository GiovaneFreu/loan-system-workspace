/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { readFileSync } from 'fs';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const tlsKeyPath = process.env.HTTP2_TLS_KEY_PATH;
  const tlsCertPath = process.env.HTTP2_TLS_CERT_PATH;

  const useHttp2 = Boolean(tlsKeyPath && tlsCertPath);
  const httpsOptions =
    useHttp2 && tlsKeyPath && tlsCertPath
      ? {
          key: readFileSync(tlsKeyPath),
          cert: readFileSync(tlsCertPath),
          allowHTTP1: true,
        }
      : undefined;

  const fastifyAdapter = new FastifyAdapter(
    useHttp2
      ? {
          http2: true,
          https: httpsOptions,
          trustProxy: true,
        }
      : {
          trustProxy: true,
        }
  );

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      // keep logs aligned with platform defaults
      bufferLogs: true,
    }
  );

  // Enable CORS for frontend communication
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: http${useHttp2 ? 's' : ''}://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
