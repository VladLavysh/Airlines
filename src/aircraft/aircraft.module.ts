import { Module } from '@nestjs/common';
import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';
import { AircraftRepository } from './aircraft.repository';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [SeatModule],
  controllers: [AircraftController],
  providers: [AircraftService, AircraftRepository, CacheLoggingInterceptor],
})
export class AircraftModule {}
