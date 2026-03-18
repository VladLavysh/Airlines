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
import { AirlineService } from './airline.service';
import { GetAirlinesQueryDto } from './dto/get-airlines.dto';
import { PatchAirlineDto } from './dto/patch-airline.dto';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('airline')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AirlineController {
  constructor(private airlineService: AirlineService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get()
  getAirlines(@Query() query: GetAirlinesQueryDto) {
    return this.airlineService.getAllAirlines(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
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
