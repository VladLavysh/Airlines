import { Injectable, Inject } from '@nestjs/common';
import { airline } from '../db/schema';
import { eq, ilike, SQL, asc, desc, and } from 'drizzle-orm';
import { IGetAllAirlines } from './types/get-all-airlines.interface';
import { IAirline } from './types/airline.interface';

@Injectable()
export class AirlineRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllAirlines) {
    const {
      limit,
      offset,
      order_by,
      order,
      name,
      iata_code,
      country,
    } = data;

    const filters = [
      name && ilike(airline.name, `%${name}%`),
      iata_code && eq(airline.iata_code, iata_code),
      country && ilike(airline.country, `%${country}%`),
    ].filter(Boolean) as SQL[];

    const orderColumn = airline[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db
      .select()
      .from(airline)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async findOneById(id: number) {
    return this.db
      .select()
      .from(airline)
      .where(eq(airline.id, id))
      .limit(1);
  }

  async createOne(name: string, iata_code: string, country: string) {
    return this.db
      .insert(airline)
      .values({ name, iata_code, country })
      .returning();
  }

  async updateOneById(id: number, data: Partial<IAirline>) {
    return this.db
      .update(airline)
      .set(data)
      .where(eq(airline.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(airline)
      .where(eq(airline.id, id))
      .returning();
  }
}
