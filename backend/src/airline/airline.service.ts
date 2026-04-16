import { Injectable, NotFoundException } from '@nestjs/common';
import { AirlineRepository } from './airline.repository';
import { IGetAllAirlines } from './types/get-all-airlines.interface';
import { IAirline } from './types/airline.interface';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class AirlineService {
  constructor(
    private repo: AirlineRepository,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  getAllAirlines(data: IGetAllAirlines) {
    return this.repo.findAll(data);
  }

  getAirlineById(id: number) {
    return this.repo.findOneById(id);
  }

  async createAirline(data: IAirline) {
    const { name, iata_code, country, price_multiplier } = data;

    const [airline] = await this.repo.createOne(name, iata_code, country, Number(price_multiplier));
    
    await this.cacheInvalidation.invalidateAirline(airline.id);
    
    return airline;
  }

  async updateAirlineById(id: number, data: Partial<IAirline>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Airline not found');
    }

    await this.cacheInvalidation.invalidateAirline(id);
    
    return rows[0];
  }

  async deleteAirlineById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Airline not found');
    }

    await this.cacheInvalidation.invalidateAirline(id);
  }
}
