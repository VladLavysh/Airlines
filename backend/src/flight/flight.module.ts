import { Module } from '@nestjs/common';
import { FlightController } from './flight.controller';
import { FlightService } from './flight.service';
import { FlightRepository } from './flight.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [FlightController],
  providers: [FlightService, FlightRepository, CacheLoggingInterceptor],
})
export class FlightModule {}
