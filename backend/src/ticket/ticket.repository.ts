import { Injectable, Inject } from '@nestjs/common';
import { ticket, booking } from 'src/db/schema';
import { eq, SQL, asc, desc, and, inArray } from 'drizzle-orm';
import { IGetAllTickets } from './types/get-all-tickets.interface';
import { ITicket } from './types/ticket.interface';

@Injectable()
export class TicketRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllTickets) {
    const { limit, offset, order_by, order, booking_id, flight_id, passenger_id } = data;

    const filters = [
      booking_id && eq(ticket.booking_id, booking_id),
      flight_id && eq(ticket.flight_id, flight_id),
      passenger_id && eq(ticket.passenger_id, passenger_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = ticket[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.ticket.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      columns: {
        booking_id: false,
        flight_id: false,
        seat_id: false,
        passenger_id: false,
      },
      with: {
        booking: {
          columns: {
            user_id: false,
          },
        },
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
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findAllByUserBookings(userId: number, data: IGetAllTickets) {
    const { limit, offset, order_by, order, booking_id, flight_id, passenger_id } = data;

    const userBookings = await this.db.query.booking.findMany({
      where: eq(booking.user_id, userId),
      columns: { id: true },
    });
    const bookingIds = userBookings.map((b: any) => b.id);

    if (bookingIds.length === 0) {
      return [];
    }

    const filters = [
      inArray(ticket.booking_id, bookingIds),
      booking_id && eq(ticket.booking_id, booking_id),
      flight_id && eq(ticket.flight_id, flight_id),
      passenger_id && eq(ticket.passenger_id, passenger_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = ticket[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.ticket.findMany({
      where: and(...filters),
      columns: {
        booking_id: false,
        flight_id: false,
        seat_id: false,
        passenger_id: false,
      },
      with: {
        booking: {
          columns: {
            user_id: false,
          },
        },
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
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findOneById(id: number) {
    return this.db.query.ticket.findFirst({
      where: eq(ticket.id, id),
      columns: {
        booking_id: false,
        flight_id: false,
        seat_id: false,
        passenger_id: false,
      },
      with: {
        booking: {
          columns: {
            user_id: false,
          },
        },
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
    });
  }

  async findOneRawById(id: number) {
    return this.db.query.ticket.findFirst({
      where: eq(ticket.id, id),
      with: {
        booking: true,
      },
    });
  }

  async createOne(data: ITicket, tx?: any) {
    const dbClient = tx || this.db;

    return dbClient
      .insert(ticket)
      .values(data)
      .returning();
  }

  async updateOneById(id: number, data: Partial<ITicket>, tx?: any) {
    const dbClient = tx || this.db;
    
    return dbClient
      .update(ticket)
      .set(data)
      .where(eq(ticket.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(ticket)
      .where(eq(ticket.id, id))
      .returning();
  }
}
