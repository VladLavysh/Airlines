import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatClassRepository } from './seat-class.repository';
import { IGetAllSeatClasses } from './types/get-all-seat-classes.interface';
import { ISeatClass } from './types/seat-class.interface';

@Injectable()
export class SeatClassService {
  constructor(private repo: SeatClassRepository) {}

  getAllSeatClasses(data: IGetAllSeatClasses) {
    return this.repo.findAll(data);
  }

  createSeatClass(data: ISeatClass) {
    const { name, price_multiplier } = data;

    return this.repo.createOne(name, Number(price_multiplier));
  }

  async updateSeatClassById(id: number, data: Partial<ISeatClass>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Seat class not found');
    }

    return rows[0];
  }

  async deleteSeatClassById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Seat class not found');
    }
  }
}
