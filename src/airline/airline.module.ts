import { Module } from '@nestjs/common';
import { AirlineController } from './airline.controller';
import { AirlineService } from './airline.service';
import { AirlineRepository } from './airline.repository';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [AirlineController],
  providers: [AirlineService, AirlineRepository, CacheLoggingInterceptor],
})
export class AirlineModule {}
