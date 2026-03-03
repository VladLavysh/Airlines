import { Module } from '@nestjs/common';
import { SeatClassService } from './seat-class.service';
import { SeatClassRepository } from './seat-class.repository';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';
import { SeatClassController } from './seat-class.controller';

@Module({
  controllers: [SeatClassController],
  providers: [SeatClassService, SeatClassRepository, CacheLoggingInterceptor],
})
export class SeatClassModule {}
