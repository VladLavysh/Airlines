import { Injectable, Inject } from '@nestjs/common';
import { seat_class } from 'src/db/schema';
import { eq, ilike, SQL, asc, desc, and } from 'drizzle-orm';
import { IGetAllSeatClasses } from './types/get-all-seat-classes.interface';
import { ISeatClass } from './types/seat-class.interface';

@Injectable()
export class SeatClassRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllSeatClasses) {
    const {
      limit,
      offset,
      order_by,
      order,
      name,
      price_multiplier,
    } = data;

    const filters = [
      name && ilike(seat_class.name, `%${name}%`),
      price_multiplier && eq(seat_class.price_multiplier, price_multiplier),
    ].filter(Boolean) as SQL[];

    const orderColumn = seat_class[order_by];
    const orderFn = order === 'desc' ? desc : asc;

    return this.db
      .select()
      .from(seat_class)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset);
  }

  async createOne(name: string, price_multiplier: number) {
    return this.db
      .insert(seat_class)
      .values({ name, price_multiplier: price_multiplier.toString() })
      .returning();
  }

  async updateOneById(id: number, data: Partial<ISeatClass>) {
    const updateData = { ...data };
    if (updateData.price_multiplier !== undefined) {
      updateData.price_multiplier = updateData.price_multiplier.toString();
    }

    return this.db
      .update(seat_class)
      .set(updateData)
      .where(eq(seat_class.id, id))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .delete(seat_class)
      .where(eq(seat_class.id, id))
      .returning();
  }
}
