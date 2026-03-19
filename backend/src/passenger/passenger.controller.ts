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
import { PassengerService } from './passenger.service';
import { GetPassengersQueryDto } from './dto/get-passengers.dto';
import { PatchPassengerDto } from './dto/patch-passenger.dto';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('passenger')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class PassengerController {
  constructor(private passengerService: PassengerService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get()
  getPassengers(@Query() query: GetPassengersQueryDto) {
    return this.passengerService.getAllPassengers(query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get(':id')
  getPassenger(@Param('id', ParseIntPipe) id: number) {
    return this.passengerService.getPassengerById(id);
  }

  @Post()
  createPassenger(@Body() body: CreatePassengerDto) {
    return this.passengerService.createPassenger(body);
  }

  @Patch(':id')
  updatePassenger(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchPassengerDto,
  ) {
    return this.passengerService.updatePassengerById(id, body);
  }

  @Delete(':id')
  deletePassenger(@Param('id', ParseIntPipe) id: number) {
    return this.passengerService.deletePassengerById(id);
  }
}
