import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { BookingTimeoutService } from './booking-timeout.service';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, BookingTimeoutService, CacheLoggingInterceptor],
  exports: [BookingRepository],
})
export class BookingModule {}
