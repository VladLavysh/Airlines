import { Injectable, Inject } from '@nestjs/common';
import { route } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and } from 'drizzle-orm';
import { IGetAllRoutes } from './types/get-all-routes.interface';
import { IRoute } from './types/route.interface';

@Injectable()
export class RouteRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllRoutes) {
    const {
      limit,
      offset,
      order_by,
      order,
      departure_airport,
      arrival_airport,
      distance_km,
    } = data;

    const filters = [
      departure_airport && ilike(route.departure_airport, `%${departure_airport}%`),
      arrival_airport && ilike(route.arrival_airport, `%${arrival_airport}%`),
      distance_km && eq(route.distance, distance_km),
    ].filter(Boolean) as SQL[];

    const orderColumn = route[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db
      .select()
      .from(route)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async findOneById(id: number) {
    return this.db
      .select()
      .from(route)
      .where(eq(route.id, id))
      .limit(1);
  }

  async createOne(data: IRoute) {
    const { departure_airport, arrival_airport, distance_km } = data;
    
    return this.db
      .insert(route)
      .values({ departure_airport, arrival_airport, distance_km })
      .returning();
  }

  async updateOneById(id: number, data: Partial<IRoute>) {
    return this.db
      .update(route)
      .set(data)
      .where(eq(route.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(route)
      .where(eq(route.id, id))
      .returning();
  }
}
