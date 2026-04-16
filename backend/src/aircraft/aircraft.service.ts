import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AircraftRepository } from './aircraft.repository';
import type { IGetAllAircraft } from './types/get-all-aircraft.interface';
import type { IAircraft } from './types/aircraft.interface';
import { SeatRepository } from 'src/seat/seat.repository';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class AircraftService {
  constructor(
    private aircraftRepo: AircraftRepository,
    private seatRepo: SeatRepository,
    private cacheInvalidation: CacheInvalidationService,
    @Inject('DB') private readonly db: any
  ) {}

  getAllAircrafts(data: IGetAllAircraft) {
    return this.aircraftRepo.findAll(data);
  }

  async getAircraftById(id: number) {
    const aircraft = await this.aircraftRepo.findOneById(id);

    if (!aircraft) {
      throw new NotFoundException('Aircraft not found');
    }

    return aircraft;
  }

  async createAircraft(data: IAircraft) {
    const { seats, ...aircraftData } = data

    if (!seats.length) {
      const [aircraft] = await this.aircraftRepo.createOne(data);
      await this.cacheInvalidation.invalidateAircraft(aircraft.id, data.airline_id);

      return aircraft;
    }

    return await this.db.transaction(async (tx: any) => {
      const [newAircraft] = await this.aircraftRepo.createOne(aircraftData, tx);

      await this.seatRepo.createMany(newAircraft.id, seats, tx)

      return this.aircraftRepo.findOneById(newAircraft.id, tx)
    }).then(async (result) => {
      await this.cacheInvalidation.invalidateAircraft(result.id, aircraftData.airline_id);

      return result;
    });
  }

  async updateAircraftById(id: number, data: Partial<IAircraft>) {
    const { seats, ...aircraftData } = data;

    const cleanedAircraftData = Object.fromEntries(
      Object.entries(aircraftData).filter(([_, value]) => value !== undefined)
    );

    if (seats === undefined) {
      const rows = await this.aircraftRepo.updateOneById(id, cleanedAircraftData);

      if (rows.length === 0) {
        throw new NotFoundException('Aircraft not found');
      }

      await this.cacheInvalidation.invalidateAircraft(id, data.airline_id);
      
      return rows;
    }

    return await this.db.transaction(async (tx: any) => {
      await this.seatRepo.deleteByAircraftId(id, tx);

      if (seats.length > 0) {
        await this.seatRepo.createMany(id, seats, tx);
      }

      if (Object.keys(cleanedAircraftData).length > 0) {
        const rows = await this.aircraftRepo.updateOneById(id, cleanedAircraftData, tx);

        if (rows.length === 0) {
          throw new NotFoundException('Aircraft not found');
        }
      }

      return this.aircraftRepo.findOneById(id, tx);
    }).then(async (result) => {
      await this.cacheInvalidation.invalidateAircraft(id, data.airline_id);
      
      return result;
    });
  }

  async deleteAircraftById(id: number) {
    const rows = await this.aircraftRepo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Aircraft not found');
    }

    await this.cacheInvalidation.invalidateAircraft(id);
  }
}
