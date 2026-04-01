import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingRepository } from './booking.repository';
import { BookingStatus } from './types/booking.interface';

@Injectable()
export class BookingTimeoutService {
  private readonly logger = new Logger(BookingTimeoutService.name);

  constructor(private readonly bookingRepo: BookingRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cancelExpiredBookings() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      const cancelledCount = await this.bookingRepo.cancelExpiredPendingBookings(fifteenMinutesAgo);
      
      if (cancelledCount > 0) {
        this.logger.log(`Cancelled ${cancelledCount} expired pending booking(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to cancel expired bookings', error);
    }
  }
}
