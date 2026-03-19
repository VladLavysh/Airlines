import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from './route.repository';
import { IGetAllRoutes } from './types/get-all-routes.interface';
import { IRoute } from './types/route.interface';
 
@Injectable()
export class RouteService {
  constructor(private repo: RouteRepository) {}
 
  getAllRoutes(data: IGetAllRoutes) {
    return this.repo.findAll(data);
  }
 
  getRouteById(id: number) {
    return this.repo.findOneById(id);
  }
 
  createRoute(data: IRoute) {
    return this.repo.createOne(data);
  }
 
  async updateRouteById(id: number, data: Partial<IRoute>) {
    const rows = await this.repo.updateOneById(id, data);
 
    if (rows.length === 0) {
      throw new NotFoundException('Route not found');
    }
 
    return rows[0];
  }
 
  async deleteRouteById(id: number) {
    const rows = await this.repo.deleteOneById(id);
 
    if (rows.length === 0) {
      throw new NotFoundException('Route not found');
    }
  }
}