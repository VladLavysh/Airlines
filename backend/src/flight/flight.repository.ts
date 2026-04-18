import { Injectable, Inject } from '@nestjs/common';
import { flight, seat, seat_class, route, aircraft, airline } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and, gte, lte, sql, min, max } from 'drizzle-orm';
import { IGetAllFlights } from './types/get-all-flights.interface';
import { IFlight } from './types/flight.interface';

@Injectable()
export class FlightRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllFlights) {
    const {
      cursor,
      order_by,
      order,
      flight_status,
      aircraft_id,
      airline_id,
      departure_time,
      departure_airport,
      arrival_airport
    } = data;

    const filters = [
      flight_status && ilike(flight.flight_status, `%${flight_status}%`),
      aircraft_id && eq(flight.aircraft_id, aircraft_id),
      airline_id && eq(flight.airline_id, airline_id),
      departure_time && gte(flight.departure_time, departure_time),
      departure_airport && ilike(route.departure_airport, `%${departure_airport}%`),
      arrival_airport && ilike(route.arrival_airport, `%${arrival_airport}%`),
    ].filter(Boolean) as SQL[];

    const orderColumn = flight[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    const query = this.db
      .select({
        id: flight.id,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        flight_status: flight.flight_status,
        aircraft: {
          id: aircraft.id,
          name: aircraft.name,
          registration_number: aircraft.registration_number,
          manufacturer: aircraft.manufacturer,
          year: aircraft.year,
          price_multiplier: aircraft.price_multiplier,
        },
        airline: {
          id: airline.id,
          name: airline.name,
          iata_code: airline.iata_code,
          country: airline.country,
          price_multiplier: airline.price_multiplier,
        },
        route: {
          id: route.id,
          departure_airport: route.departure_airport,
          arrival_airport: route.arrival_airport,
          distance: route.distance,
          base_price: route.base_price,
        },
      })
      .from(flight)
      .innerJoin(route, eq(flight.route_id, route.id))
      .innerJoin(aircraft, eq(flight.aircraft_id, aircraft.id))
      .innerJoin(airline, eq(flight.airline_id, airline.id))
      .where(and(
        cursor ? gte(flight.id, cursor) : undefined,
        ...filters
      ))
      .orderBy(orderFn(orderColumn))
      .limit(10);

    const results = await query;

    return results.map(row => ({
      ...row,
      aircraft: row.aircraft,
      airline: row.airline,
      route: row.route,
    }));
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
