import { Module } from '@nestjs/common';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { RouteRepository } from './route.repository';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Module({
  controllers: [RouteController],
  providers: [RouteService, RouteRepository, CacheLoggingInterceptor],
})
export class RouteModule {}
