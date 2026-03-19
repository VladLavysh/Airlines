import { Module } from '@nestjs/common';
import { PassengerController } from './passenger.controller';
import { PassengerService } from './passenger.service';
import { PassengerRepository } from './passenger.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [PassengerController],
  providers: [PassengerService, PassengerRepository, CacheLoggingInterceptor],
  exports: [PassengerRepository],
})
export class PassengerModule {}
