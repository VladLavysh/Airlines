import { Injectable, Inject } from '@nestjs/common';
import { eq, ilike, and, SQL, asc, desc, count, sql } from 'drizzle-orm';
import { aircraft, seat } from 'src/db/schema';
import { IAircraft } from './types/aircraft.interface';
import { IGetAllAircraft } from './types/get-all-aircraft.interface';

@Injectable()
export class AircraftRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllAircraft) {
    const {
      limit,
      offset,
      order_by,
      order,
      name,
      registration_number,
      manufacturer,
      year,
      price_multiplier,
      airline_id
    } = data;

    const filters = [
      name && ilike(aircraft.name, `%${name}%`),
      registration_number && eq(aircraft.registration_number, registration_number),
      manufacturer && ilike(aircraft.manufacturer, `%${manufacturer}%`),
      year && eq(aircraft.year, year),
      price_multiplier && eq(aircraft.price_multiplier, price_multiplier),
      airline_id && eq(aircraft.airline_id, airline_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = aircraft[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    const seatCountSubquery = this.db
      .select({
        aircraft_id: seat.aircraft_id,
        total_seats: count(seat.id).as('total_seats')
      })
      .from(seat)
      .groupBy(seat.aircraft_id)
      .as('seat_counts');
  
    return this.db
      .select({
        id: aircraft.id,
        name: aircraft.name,
        registration_number: aircraft.registration_number,
        manufacturer: aircraft.manufacturer,
        year: aircraft.year,
        price_multiplier: aircraft.price_multiplier,
        airline_id: aircraft.airline_id,
        total_seats: sql<number>`COALESCE(${seatCountSubquery.total_seats}, 0)::integer`
      })
      .from(aircraft)
      .leftJoin(seatCountSubquery, eq(seatCountSubquery.aircraft_id, aircraft.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async findOneById(id: number, tx?: any) {
    const dbClient = tx || this.db;
    
    return dbClient.query.aircraft.findFirst({
      where: eq(aircraft.id, id),
      with: {
        seats: {
          columns: {
            seat_class_id: false,
            aircraft_id: false
          },
          with: {
            class: true
          }
        }
      }
    })
  }

  async createOne(data: Omit<IAircraft, 'seats'>, tx?: any) {
    const dbClient = tx || this.db
    const { name, registration_number, manufacturer, year, price_multiplier, airline_id } = data;

    return dbClient
      .insert(aircraft)
      .values({ name, registration_number, manufacturer, year, price_multiplier: price_multiplier.toString(), airline_id })
      .returning();
  }

  async updateOneById(id: number, data: Partial<IAircraft>, tx?: any) {
    const dbClient = tx || this.db;
    const updateData = { ...data };
    if (updateData.price_multiplier !== undefined) {
      updateData.price_multiplier = updateData.price_multiplier.toString();
    }

    return dbClient
      .update(aircraft)
      .set(updateData)
      .where(eq(aircraft.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(aircraft)
      .where(eq(aircraft.id, id))
      .returning();
  }
}
