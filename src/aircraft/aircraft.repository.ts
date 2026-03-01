import { Injectable, Inject } from '@nestjs/common';
import { aircraft } from '../db/schema';
import { eq, gte, lte, ilike, and, SQL, asc, desc } from 'drizzle-orm';
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
      total_seats_from,
      total_seats_to,
      airline_id
    } = data;

    const filters = [
      name && ilike(aircraft.name, `%${name}%`),
      registration_number && eq(aircraft.registration_number, registration_number),
      manufacturer && ilike(aircraft.manufacturer, `%${manufacturer}%`),
      year && eq(aircraft.year, year),
      total_seats_from && gte(aircraft.total_seats, total_seats_from),
      total_seats_to && lte(aircraft.total_seats, total_seats_to),
      airline_id && eq(aircraft.airline_id, airline_id),
    ].filter(Boolean) as SQL[];

    const orderColumn = aircraft[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db
      .select()
      .from(aircraft)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async findOneById(id: number) {
    return this.db
      .select()
      .from(aircraft)
      .where(eq(aircraft.id, id))
      .limit(1);
  }

  async createOne(data: IAircraft) {
    const { name, registration_number, manufacturer, year, total_seats, airline_id } = data;

    return this.db
      .insert(aircraft)
      .values({ name, registration_number, manufacturer, year, total_seats, airline_id })
      .returning();
  }

  async updateOneById(id: number, data: Partial<IAircraft>) {
    return this.db
      .update(aircraft)
      .set(data)
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
