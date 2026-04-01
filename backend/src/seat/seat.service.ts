import { Injectable } from '@nestjs/common';
import { SeatRepository } from './seat.repository';
import { IGetAllSeats } from './types/get-all-seats.interface';

@Injectable()
export class SeatService {
  constructor(private repo: SeatRepository) {}

  getAllSeats(data: IGetAllSeats) {
    return this.repo.findAll(data);
  }
}
