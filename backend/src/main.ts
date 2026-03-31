import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { ThrottlerGuard } from '@nestjs/throttler';
import { Logger } from 'nestjs-pino';
import compression from 'compression';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));

  app.use(helmet());

  app.use(compression());

  const corsOrigin = config.getOrThrow<string>('SERVER_CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin.includes(',') 
      ? corsOrigin.split(',').map(origin => origin.trim())
      : corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove unknown properties
      transform: true, // automatically transforms query strings to DTO types
      forbidNonWhitelisted: true, // throw error if unknown properties are present
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  // app.useGlobalFilters(new PostgresExceptionFilter());

  // app.useGlobalGuards(app.get(ThrottlerGuard));

  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('SERVER_PORT') || 4000;
  app.listen(port);
}
bootstrap();
