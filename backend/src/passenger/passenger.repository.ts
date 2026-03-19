import { Injectable, Inject } from '@nestjs/common';
import { passenger } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and } from 'drizzle-orm';
import { IGetAllPassengers } from './types/get-all-passengers.interface';
import { IPassenger } from './types/passenger.interface';

@Injectable()
export class PassengerRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllPassengers) {
    const { limit, offset, order_by, order, first_name, last_name, passport_number } = data;

    const filters = [
      first_name && ilike(passenger.first_name, `%${first_name}%`),
      last_name && ilike(passenger.last_name, `%${last_name}%`),
      passport_number && ilike(passenger.passport_number, `%${passport_number}%`),
    ].filter(Boolean) as SQL[];

    const orderColumn = passenger[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.passenger.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        tickets: true,
      },
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findOneById(id: number) {
    return this.db.query.passenger.findFirst({
      where: eq(passenger.id, id),
      with: {
        tickets: true,
      },
    });
  }

  async createOne(data: IPassenger, tx?: any) {
    const dbClient = tx || this.db;

    return dbClient
      .insert(passenger)
      .values(data)
      .returning();
  }

  async updateOneById(id: number, data: Partial<IPassenger>) {
    return this.db
      .update(passenger)
      .set({ ...data, updated_at: new Date() })
      .where(eq(passenger.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(passenger)
      .where(eq(passenger.id, id))
      .returning();
  }
}
