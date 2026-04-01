import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { seat } from 'src/db/schema';
import { IAircraftSeat } from 'src/seat/types/seat.interface';
import { IGetAllSeats } from './types/get-all-seats.interface';

@Injectable()
export class SeatRepository {
  constructor(@Inject('DB') private readonly db: any) {}

  async findAll(data: IGetAllSeats) {
    const { limit, offset, aircraft_id } = data;

    const filters = aircraft_id ? [eq(seat.aircraft_id, aircraft_id)] : [];

    return this.db.query.seat.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        class: true,
        aircraft: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit,
      offset,
    });
  }

  async createMany(aircraftId: number, seats: IAircraftSeat[], tx?: any) {
    const dbClient = tx || this.db;
    
    return dbClient
      .insert(seat)
      .values(
        seats.map(s => ({
          seat_number: s.seat_number,
          seat_class_id: s.seat_class_id,
          aircraft_id: aircraftId,
        }))
      )
      .returning();
  }

  async deleteByAircraftId(aircraftId: number, tx?: any) {
    const dbClient = tx || this.db;
    
    return dbClient
      .delete(seat)
      .where(eq(seat.aircraft_id, aircraftId));
  }
}