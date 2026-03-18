import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Delete,
  ParseIntPipe,
  Body,
  Patch,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { GetRoutesQueryDto } from './dto/get-routes.dto';
import { PatchRouteDto } from './dto/patch-route.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('route')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RouteController {
  constructor(private routeService: RouteService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get()
  getRoutes(@Query() query: GetRoutesQueryDto) {
    return this.routeService.getAllRoutes(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get(':id')
  getRoute(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.getRouteById(id);
  }

  @Post()
  createRoute(@Body() body: CreateRouteDto) {
    return this.routeService.createRoute(body);
  }

  @Patch(':id')
  updateRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchRouteDto,
  ) {
    return this.routeService.updateRouteById(id, body);
  }

  @Delete(':id')
  deleteRoute(@Param('id', ParseIntPipe) id: number) {
    return this.routeService.deleteRouteById(id);
  }
}
