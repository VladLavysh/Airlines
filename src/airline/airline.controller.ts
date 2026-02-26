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
} from '@nestjs/common';
import { AirlineService } from './airline.service';
import { GetAirlinesQueryDto } from './dto/get-airlines.dto';
import { PatchAirlineDto } from './dto/patch-airline.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';

@Controller('airline')
export class AirlineController {
  constructor(private airlineService: AirlineService) {}

  @Get()
  getAirlines(@Query() query: GetAirlinesQueryDto) {
    const { limit, offset, search } = query;

    return this.airlineService.getAllAirlines({
      limit,
      offset,
      search,
    });
  }

  @Get(':id')
  getAirline(@Param('id', ParseIntPipe) id: number) {
    return this.airlineService.getAirlineById(id);
  }

  @Post()
  createAirline(@Body() body: CreateAirlineDto) {
    const { name, iata_code, country } = body;

    return this.airlineService.createAirline({ name, iata_code, country });
  }

  @Patch(':id')
  updateAirline(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchAirlineDto,
  ) {
    return this.airlineService.updateAirlineById(id, body);
  }

  @Delete(':id')
  deleteAirline(@Param('id', ParseIntPipe) id: number) {
    return this.airlineService.deleteAirlineById(id);
  }
}
