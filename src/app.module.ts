import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DbModule } from './db/db.module';
import { AirlineModule } from './airline/airline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                },
              },
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10 * 1000 * 60, // 10 minutes
          limit: 100,
        },
      ],
    }),
    DbModule,
    AirlineModule,
  ],
})
export class AppModule {}
