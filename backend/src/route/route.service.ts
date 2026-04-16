import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from './route.repository';
import { IGetAllRoutes } from './types/get-all-routes.interface';
import { IRoute } from './types/route.interface';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class RouteService {
  constructor(
    private repo: RouteRepository,
    private cacheInvalidation: CacheInvalidationService,
  ) {}

  getAllRoutes(data: IGetAllRoutes) {
    return this.repo.findAll(data);
  }

  getRouteById(id: number) {
    return this.repo.findOneById(id);
  }

  async createRoute(data: IRoute) {
    const [route] = await this.repo.createOne(data);
    
    await this.cacheInvalidation.invalidateRoute(route.id);
    
    return route;
  }

  async updateRouteById(id: number, data: Partial<IRoute>) {
    const rows = await this.repo.updateOneById(id, data);

    if (rows.length === 0) {
      throw new NotFoundException('Route not found');
    }

    await this.cacheInvalidation.invalidateRoute(id);
    
    return rows[0];
  }

  async deleteRouteById(id: number) {
    const rows = await this.repo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Route not found');
    }

    await this.cacheInvalidation.invalidateRoute(id);
  }
}