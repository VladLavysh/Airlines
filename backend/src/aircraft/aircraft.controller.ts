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
import { AircraftService } from './aircraft.service';
import { GetAircraftQueryDto } from './dto/get-aircraft.dto';
import { PatchAircraftDto } from './dto/patch-aircraft.dto';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('aircraft')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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
