import { Module } from '@nestjs/common';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { SeatRepository } from './seat.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [SeatController],
  providers: [SeatService, SeatRepository, CacheLoggingInterceptor],
  exports: [SeatRepository]
})
export class SeatModule {}
