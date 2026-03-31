import { Injectable, NotFoundException } from '@nestjs/common';
import { FlightRepository } from './flight.repository';
import { IGetAllFlights } from './types/get-all-flights.interface';
import { IFlight } from './types/flight.interface';
 
@Injectable()
export class FlightService {
  constructor(private repo: FlightRepository) {}

  private calculatePriceRange(
    basePrice: string,
    airlineMultiplier: string,
    aircraftMultiplier: string,
    minSeatClassMultiplier: string | null,
    maxSeatClassMultiplier: string | null,
  ) {
    const base = parseFloat(basePrice);
    const airlineMult = parseFloat(airlineMultiplier);
    const aircraftMult = parseFloat(aircraftMultiplier);
    
    // Use default multiplier of 1.0 if aircraft has no seats configured
    const minMult = minSeatClassMultiplier ? parseFloat(minSeatClassMultiplier) : 1.0;
    const maxMult = maxSeatClassMultiplier ? parseFloat(maxSeatClassMultiplier) : 1.0;

    const price_from = (base * airlineMult * aircraftMult * minMult).toFixed(2);
    const price_to = (base * airlineMult * aircraftMult * maxMult).toFixed(2);

    return { price_from, price_to };
  }

  async getAllFlights(data: IGetAllFlights) {
    const flights = await this.repo.findAll(data);

    const enriched = await Promise.all(
      flights.map(async (f: any) => {
        const { aircraft_id, ...rest } = f;
        const seatRange = await this.repo.getSeatClassMultiplierRange(aircraft_id);
        const { price_from, price_to } = this.calculatePriceRange(
          f.route.base_price,
          f.airline.price_multiplier,
          f.aircraft.price_multiplier,
          seatRange?.min_multiplier,
          seatRange?.max_multiplier,
        );
        return { ...rest, price_from, price_to };
      }),
    );

    return enriched;
  }

  async getFlightById(id: number) {
    const f = await this.repo.findOneById(id);

    if (!f) {
      throw new NotFoundException('Flight not found');
    }

    const { aircraft_id, ...rest } = f;
    const seatRange = await this.repo.getSeatClassMultiplierRange(aircraft_id);
    const { price_from, price_to } = this.calculatePriceRange(
      f.route.base_price,
      f.airline.price_multiplier,
      f.aircraft.price_multiplier,
      seatRange?.min_multiplier,
      seatRange?.max_multiplier,
    );

    return { ...rest, price_from, price_to };
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
