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
import { AircraftService } from './aircraft.service';
import { GetAircraftQueryDto } from './dto/get-aircraft.dto';
import { PatchAircraftDto } from './dto/patch-aircraft.dto';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from '../common/interceptors/cache-logging.interceptor';

@Controller('aircraft')
export class AircraftController {
  constructor(private aircraftService: AircraftService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get()
  getAircrafts(@Query() query: GetAircraftQueryDto) {
    return this.aircraftService.getAllAircrafts(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get(':id')
  getAircraftById(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.getAircraftById(id);
  }

  @Post()
  createAircraft(@Body() body: CreateAircraftDto) {
    return this.aircraftService.createAircraft(body);
  }

  @Patch(':id')
  updateAircraft(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchAircraftDto,
  ) {
    return this.aircraftService.updateAircraftById(id, body);
  }

  @Delete(':id')
  deleteAircraft(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.deleteAircraftById(id);
  }
}
