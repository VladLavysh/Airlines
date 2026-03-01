import { Injectable, NotFoundException } from '@nestjs/common';
import { AircraftRepository } from './aircraft.repository';
import { IGetAllAircraft } from './types/get-all-aircraft.interface';
import { IAircraft } from './types/aircraft.interface';

@Injectable()
export class AircraftService {
  constructor(private repo: AircraftRepository) {}

  getAllAircrafts(data: IGetAllAircraft) {
    return this.repo.findAll(data);
  }

  async getAircraftById(id: number) {
    const rows = await this.repo.findOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Aircraft not found');
    }

    return rows[0];
  }

  createAircraft(data: IAircraft) {
    return this.repo.createOne(data);
  }

  async updateAircraftById(id: number, data: Partial<IAircraft>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Aircraft not found');
    }

    return rows;
  }

  async deleteAircraftById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Aircraft not found');
    }
  }
}
