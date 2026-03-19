import { Module } from '@nestjs/common';
import { SeatRepository } from './seat.repository';

@Module({
  providers: [SeatRepository],
  exports: [SeatRepository]
})
export class SeatModule {}
