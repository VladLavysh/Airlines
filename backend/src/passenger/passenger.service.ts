import { Injectable, NotFoundException } from '@nestjs/common';
import { PassengerRepository } from './passenger.repository';
import { IGetAllPassengers } from './types/get-all-passengers.interface';
import { IPassenger } from './types/passenger.interface';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class PassengerService {
  constructor(
    private repo: PassengerRepository,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  getAllPassengers(data: IGetAllPassengers) {
    return this.repo.findAll(data);
  }

  async getPassengerById(id: number) {
    const passenger = await this.repo.findOneById(id);

    if (!passenger) {
      throw new NotFoundException('Passenger not found');
    }

    return passenger;
  }

  async createPassenger(data: IPassenger) {
    const [passenger] = await this.repo.createOne(data);
    
    await this.cacheInvalidation.invalidatePassenger(passenger.id);
    
    return passenger;
  }

  async updatePassengerById(id: number, data: Partial<IPassenger>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Passenger not found');
    }

    await this.cacheInvalidation.invalidatePassenger(id);
    
    return rows[0];
  }

  async deletePassengerById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Passenger not found');
    }

    await this.cacheInvalidation.invalidatePassenger(id);
  }
}
