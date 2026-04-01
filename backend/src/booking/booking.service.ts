import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { IGetAllBookings } from './types/get-all-bookings.interface';
import { IBooking, BookingStatus } from './types/booking.interface';
import { UserRole } from 'src/user/types/user.interface';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.interface';

@Injectable()
export class BookingService {
  constructor(private repo: BookingRepository) {}

  getAllBookings(user: AuthenticatedUser, data: IGetAllBookings) {
    if (user.role === UserRole.ADMIN) {
      return this.repo.findAll(data);
    }

    return this.repo.findAllByUserId(user.id, data);
  }

  async getBookingById(user: AuthenticatedUser, id: number) {
    const booking = await this.repo.findOneById(id);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== UserRole.ADMIN && booking.user?.id !== user.id) {
      throw new ForbiddenException('You can only view your own bookings');
    }

    return booking;
  }

  async createBooking(userId: number, data: { status?: BookingStatus; flight_id: number }) {
    const bookingData: IBooking = {
      status: data?.status || BookingStatus.PENDING,
      user_id: userId,
      flight_id: data.flight_id,
    };

    const [booking] = await this.repo.createOne(bookingData);
    return booking;
  }

  async updateBookingById(user: AuthenticatedUser, id: number, data: Partial<IBooking>) {
    const existing = await this.repo.findOneById(id);

    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== UserRole.ADMIN && existing.user?.id !== user.id) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    // Validate that booking has at least one passenger before confirming
    if (data.status === BookingStatus.CONFIRMED) {
      const ticketCount = await this.repo.countTicketsByBookingId(id);
      if (ticketCount === 0) {
        throw new ForbiddenException('Cannot confirm booking without passengers. Please add at least one passenger first.');
      }
    }

    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    return rows[0];
  }

  async deleteBookingById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }
  }
}
