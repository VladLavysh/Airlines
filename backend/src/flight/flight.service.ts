import { Injectable, NotFoundException } from '@nestjs/common';
import { FlightRepository } from './flight.repository';
import { IGetAllFlights } from './types/get-all-flights.interface';
import { IFlight } from './types/flight.interface';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';
 
@Injectable()
export class FlightService {
  constructor(
    private repo: FlightRepository,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

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
 
  async createFlight(data: IFlight) {
    const [flight] = await this.repo.createOne(data);
    
    // Invalidate flight cache
    await this.cacheInvalidation.invalidateFlight(flight.id, data.route_id, data.airline_id, data.aircraft_id);
    
    return flight;
  }
 
  async updateFlightById(id: number, data: Partial<IFlight>) {
    const existing = await this.repo.findOneById(id);
    const rows = await this.repo.updateOneById(id, data);
 
    if (rows.length === 0) {
      throw new NotFoundException('Flight not found');
    }
 
    // Invalidate flight cache (use both old and new values if changed)
    await this.cacheInvalidation.invalidateFlight(
      id,
      data.route_id || existing?.route?.id,
      data.airline_id || existing?.airline?.id,
      data.aircraft_id || existing?.aircraft?.id,
    );
    
    return rows[0];
  }
 
  async deleteFlightById(id: number) {
    const rows = await this.repo.deleteOneById(id);
 
    if (rows.length === 0) {
      throw new NotFoundException('Flight not found');
    }
 
    // Invalidate flight cache
    await this.cacheInvalidation.invalidateFlight(id);
  }
}
