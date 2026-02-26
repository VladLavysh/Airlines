import { Injectable, NotFoundException } from '@nestjs/common';
import { AirlineRepository } from './airline.repository';
import { IGetAllAirlines } from './types/get-all-airlines.interface';
import { IAirline } from './types/airline.interface';

@Injectable()
export class AirlineService {
  constructor(private repo: AirlineRepository) {}

  getAllAirlines(data: IGetAllAirlines) {
    const { limit, offset, search } = data;

    // Add redis cache
    return this.repo.findAll(limit, offset, search);
  }

  getAirlineById(id: number) {
    return this.repo.findOneById(id);
  }

  createAirline(data: IAirline) {
    const { name, iata_code, country } = data;

    return this.repo.createOne(name, iata_code, country);
  }

  async updateAirlineById(id: number, data: Partial<IAirline>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Airline not found');
    }

    return rows[0];
  }

  async deleteAirlineById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Airline not found');
    }
  }
}
