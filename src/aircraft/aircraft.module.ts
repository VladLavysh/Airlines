import { Module } from '@nestjs/common';
import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';
import { AircraftRepository } from './aircraft.repository';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [AircraftController],
  providers: [AircraftService, AircraftRepository, CacheLoggingInterceptor],
})
export class AircraftModule {}
