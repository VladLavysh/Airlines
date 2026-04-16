import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatClassRepository } from './seat-class.repository';
import { IGetAllSeatClasses } from './types/get-all-seat-classes.interface';
import { ISeatClass } from './types/seat-class.interface';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class SeatClassService {
  constructor(
    private repo: SeatClassRepository,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  getAllSeatClasses(data: IGetAllSeatClasses) {
    return this.repo.findAll(data);
  }

  async createSeatClass(data: ISeatClass) {
    const { name, price_multiplier } = data;

    const [seatClass] = await this.repo.createOne(name, Number(price_multiplier));
    
    await this.cacheInvalidation.invalidateSeatClass(seatClass.id);
    
    return seatClass;
  }

  async updateSeatClassById(id: number, data: Partial<ISeatClass>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Seat class not found');
    }

    await this.cacheInvalidation.invalidateSeatClass(id);
    
    return rows[0];
  }

  async deleteSeatClassById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Seat class not found');
    }

    await this.cacheInvalidation.invalidateSeatClass(id);
  }
}
