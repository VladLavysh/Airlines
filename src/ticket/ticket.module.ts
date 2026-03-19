import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { PassengerModule } from 'src/passenger/passenger.module';
import { BookingModule } from 'src/booking/booking.module';

@Module({
  imports: [PassengerModule, BookingModule],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, CacheLoggingInterceptor],
})
export class TicketModule {}
