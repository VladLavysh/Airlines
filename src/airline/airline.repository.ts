import { Injectable, Inject } from '@nestjs/common';
import { airline } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';
import { IAirline } from './types/airline.interface';

@Injectable()
export class AirlineRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(limit: number, offset: number, search?: string) {
    let query = this.db.select().from(airline);

    if (search) {
      query = query.where(ilike(airline.name, `%${search}%`));
    }

    return query.orderBy(airline.name).limit(limit).offset(offset);
  }

  async findOneById(id: number) {
    return this.db.select().from(airline).where(eq(airline.id, id)).limit(1);
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
    return this.db.delete(airline).where(eq(airline.id, id)).returning();
  }
}
