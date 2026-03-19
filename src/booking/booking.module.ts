import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, CacheLoggingInterceptor],
  exports: [BookingRepository],
})
export class BookingModule {}
