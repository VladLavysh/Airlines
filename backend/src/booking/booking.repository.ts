import { Injectable, Inject } from '@nestjs/common';
import { booking, ticket } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and, lte, sql } from 'drizzle-orm';
import { IGetAllBookings } from './types/get-all-bookings.interface';
import { IBooking } from './types/booking.interface';

@Injectable()
export class BookingRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllBookings) {
    const { limit, offset, order_by, order, status, user_id } = data;

    const filters = [
      status && ilike(booking.status, `%${status}%`),
      user_id && eq(booking.user_id, user_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = booking[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.booking.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      columns: {
        id: true,
        user_id: false,
        flight_id: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        flight: {
          columns: {
            route_id: false,
            aircraft_id: false,
            airline_id: false,
          },
          with: {
            route: true,
            airline: true,
            aircraft: true,
          },
        },
        tickets: {
          columns: {
            booking_id: false,
            flight_id: false,
            seat_id: false,
            passenger_id: false,
          },
          with: {
            flight: {
              columns: {
                route_id: false,
                aircraft_id: false,
                airline_id: false,
              },
            },
            seat: {
              columns: {
                aircraft_id: false,
                seat_class_id: false,
              },
            },
            passenger: true,
          },
        },
      },
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findAllByUserId(userId: number, data: IGetAllBookings) {
    const { limit, offset, order_by, order, status } = data;

    const filters = [
      eq(booking.user_id, userId),
      status && ilike(booking.status, `%${status}%`),
    ].filter(Boolean) as SQL[];

    const orderColumn = booking[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.booking.findMany({
      where: and(...filters),
      columns: {
        id: true,
        user_id: false,
        flight_id: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        flight: {
          columns: {
            route_id: false,
            aircraft_id: false,
            airline_id: false,
          },
          with: {
            route: true,
            airline: true,
            aircraft: true,
          },
        },
        tickets: {
          columns: {
            booking_id: false,
            flight_id: false,
            seat_id: false,
            passenger_id: false,
          },
          with: {
            flight: {
              columns: {
                route_id: false,
                aircraft_id: false,
                airline_id: false,
              },
            },
            seat: {
              columns: {
                aircraft_id: false,
                seat_class_id: false,
              },
            },
            passenger: true,
          },
        },
      },
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findOneById(id: number) {
    return this.db.query.booking.findFirst({
      where: eq(booking.id, id),
      columns: {
        id: true,
        user_id: false,
        flight_id: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        flight: {
          columns: {
            route_id: false,
            aircraft_id: false,
            airline_id: false,
          },
          with: {
            route: true,
            airline: true,
            aircraft: true,
          },
        },
        tickets: {
          columns: {
            booking_id: false,
            flight_id: false,
            seat_id: false,
            passenger_id: false,
          },
          with: {
            flight: {
              columns: {
                route_id: false,
                aircraft_id: false,
                airline_id: false,
              },
            },
            seat: {
              columns: {
                aircraft_id: false,
                seat_class_id: false,
              },
            },
            passenger: true,
          },
        },
      },
    });
  }

  async createOne(data: IBooking) {
    return this.db
      .insert(booking)
      .values(data)
      .returning();
  }

  async updateOneById(id: number, data: Partial<IBooking>) {
    return this.db
      .update(booking)
      .set({ ...data, updated_at: new Date() })
      .where(eq(booking.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(booking)
      .where(eq(booking.id, id))
      .returning();
  }

  async cancelExpiredPendingBookings(expirationTime: Date): Promise<number> {
    const result = await this.db
      .update(booking)
      .set({ status: 'cancelled', updated_at: new Date() })
      .where(
        and(
          eq(booking.status, 'pending'),
          lte(booking.created_at, expirationTime)
        )
      )
      .returning({ id: booking.id });
    
    return result.length;
  }

  async countTicketsByBookingId(bookingId: number): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(ticket)
      .where(eq(ticket.booking_id, bookingId));
    
    return result[0]?.count || 0;
  }
}
