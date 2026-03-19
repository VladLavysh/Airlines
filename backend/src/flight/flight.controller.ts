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
import { FlightService } from './flight.service';
import { GetFlightsQueryDto } from './dto/get-flights.dto';
import { PatchFlightDto } from './dto/patch-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('flight')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FlightController {
  constructor(private flightService: FlightService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Public()
  @Get()
  getFlights(@Query() query: GetFlightsQueryDto) {
    return this.flightService.getAllFlights(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  getFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getFlightById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  createFlight(@Body() body: CreateFlightDto) {
    return this.flightService.createFlight(body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updateFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchFlightDto,
  ) {
    return this.flightService.updateFlightById(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.deleteFlightById(id);
  }
}
