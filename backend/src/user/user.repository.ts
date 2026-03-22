import { Injectable, Inject } from '@nestjs/common';
import { eq, isNull, and, asc, desc } from 'drizzle-orm';
import { user } from 'src/db/schema';
import { IUser } from './types/user.interface';

@Injectable()
export class UserRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: { limit: number; offset: number; order_by?: string; order?: 'asc' | 'desc' }) {
    const { limit, offset, order_by = 'id', order = 'asc' } = data;
    const orderColumn = user[order_by] || user.id;
    const orderFn = order === 'desc' ? desc : asc;

    return this.db.query.user.findMany({
      where: isNull(user.deleted_at),
      orderBy: orderFn(orderColumn),
      limit,
      offset,
    });
  }

  async findOneById(id: number) {
    return this.db
      .select()
      .from(user)
      .where(and(eq(user.id, id), isNull(user.deleted_at)))
      .limit(1);
  }

  async findOneByEmail(email: string) {
    return this.db
      .select()
      .from(user)
      .where(and(eq(user.email, email), isNull(user.deleted_at)))
      .limit(1);
  }

  async createOne(data: Omit<IUser, 'deleted_at'>) {
    const { email, role, first_name, last_name, password } = data;
    
    return this.db
      .insert(user)
      .values({ email, role, first_name, last_name, password })
      .returning();
  }

  async updateOneById(id: number, data: Partial<Omit<IUser, 'deleted_at'>>) {
    return this.db
      .update(user)
      .set(data)
      .where(and(eq(user.id, id), isNull(user.deleted_at)))
      .returning();
  }

  async deleteOneById(id: number) {
    return this.db
      .update(user)
      .set({ deleted_at: new Date() })
      .where(and(eq(user.id, id), isNull(user.deleted_at)))
      .returning();
  }
}
