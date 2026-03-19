import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { seat } from 'src/db/schema';
import { IAircraftSeat } from 'src/seat/types/seat.interface';

@Injectable()
export class SeatRepository {
  constructor(@Inject('DB') private readonly db: any) {}

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