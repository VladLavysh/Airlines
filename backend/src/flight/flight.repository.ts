import { Injectable, Inject } from '@nestjs/common';
import { flight, seat, seat_class } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and, gte, lte, sql, min, max } from 'drizzle-orm';
import { IGetAllFlights } from './types/get-all-flights.interface';
import { IFlight } from './types/flight.interface';

@Injectable()
export class FlightRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllFlights) {
    const {
      limit,
      offset,
      order_by,
      order,
      flight_status,
      aircraft_id,
      airline_id
    } = data;

    const filters = [
      flight_status && ilike(flight.flight_status, `%${flight_status}%`),
      aircraft_id && eq(flight.aircraft_id, aircraft_id),
      airline_id && eq(flight.airline_id, airline_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = flight[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.flight.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      columns: {
        route_id: false,
        airline_id: false
      },
      with: {
        aircraft: {
          columns: {
            id: false,
            airline_id: false
          }
        },
        airline: {
          columns: {
            id: false,
          }
        },
        route: {
          columns: {
            id: false,
          }
        },
      },
      orderBy: orderFn(orderColumn),
      limit,
      offset
    });
  }

  async findOneById(id: number) {
    return this.db.query.flight.findFirst({
      where: eq(flight.id, id),
      columns: {
        route_id: false,
        airline_id: false
      },
      with: {
        aircraft: {
          columns: {
            id: false,
            airline_id: false
          }
        },
        airline: {
          columns: {
            id: false,
          }
        },
        route: {
          columns: {
            id: false,
          }
        },
      }
    })
  }

  async getSeatClassMultiplierRange(aircraftId: number) {
    const [result] = await this.db
      .select({
        min_multiplier: min(seat_class.price_multiplier),
        max_multiplier: max(seat_class.price_multiplier),
      })
      .from(seat)
      .innerJoin(seat_class, eq(seat.seat_class_id, seat_class.id))
      .where(eq(seat.aircraft_id, aircraftId));

    return result;
  }

  async createOne(data: IFlight) {
    const { departure_time, arrival_time, flight_status, route_id, aircraft_id, airline_id } = data;
    
    return this.db
      .insert(flight)
      .values({ departure_time, arrival_time, flight_status, route_id, aircraft_id, airline_id })
      .returning();
  }

  async updateOneById(id: number, data: Partial<IFlight>) {
    return this.db
      .update(flight)
      .set(data)
      .where(eq(flight.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(flight)
      .where(eq(flight.id, id))
      .returning();
  }
}
