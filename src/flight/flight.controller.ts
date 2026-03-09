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
} from '@nestjs/common';
import { FlightService } from './flight.service';
import { GetFlightsQueryDto } from './dto/get-flights.dto';
import { PatchFlightDto } from './dto/patch-flight.dto';
import { CreateFlightDto } from './dto/create-flight.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';

@Controller('flight')
export class FlightController {
  constructor(private flightService: FlightService) {}

  // @UseInterceptors(CacheLoggingInterceptor)
  // @CacheTTL(60_000)
  @Get()
  getFlights(@Query() query: GetFlightsQueryDto) {
    return this.flightService.getAllFlights(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get(':id')
  getFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.getFlightById(id);
  }

  @Post()
  createFlight(@Body() body: CreateFlightDto) {
    return this.flightService.createFlight(body);
  }

  @Patch(':id')
  updateFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchFlightDto,
  ) {
    return this.flightService.updateFlightById(id, body);
  }

  @Delete(':id')
  deleteFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightService.deleteFlightById(id);
  }
}
