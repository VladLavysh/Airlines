import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { ThrottlerGuard } from '@nestjs/throttler';
import { Logger } from 'nestjs-pino';
import compression from 'compression';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { PostgresExceptionFilter } from './common/filters/database-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));

  app.use(helmet());

  app.use(compression());

  app.enableCors({
    origin: config.get<string>('SERVER_CORS_ORIGIN'),
    credentials: true,
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

  const port = config.get<number>('SERVER_PORT') || 3000;
  await app.listen(port);
}
bootstrap();
