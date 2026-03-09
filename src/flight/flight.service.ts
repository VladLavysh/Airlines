import { Injectable, NotFoundException } from '@nestjs/common';
import { FlightRepository } from './flight.repository';
import { IGetAllFlights } from './types/get-all-flights.interface';
import { IFlight } from './types/flight.interface';
 
@Injectable()
export class FlightService {
  constructor(private repo: FlightRepository) {}
 
  getAllFlights(data: IGetAllFlights) {
    return this.repo.findAll(data);
  }
 
  getFlightById(id: number) {
    return this.repo.findOneById(id);
  }
 
  createFlight(data: IFlight) {
    return this.repo.createOne(data);
  }
 
  async updateFlightById(id: number, data: Partial<IFlight>) {
    const rows = await this.repo.updateOneById(id, data);
 
    if (rows.length === 0) {
      throw new NotFoundException('Flight not found');
    }
 
    return rows[0];
  }
 
  async deleteFlightById(id: number) {
    const rows = await this.repo.deleteOneById(id);
 
    if (rows.length === 0) {
      throw new NotFoundException('Flight not found');
    }
  }
}
