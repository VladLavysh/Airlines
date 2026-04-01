import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { SeatService } from './seat.service';
import { GetSeatsQueryDto } from './dto/get-seats.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('seat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeatController {
  constructor(private seatService: SeatService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get()
  getSeats(@Query() query: GetSeatsQueryDto) {
    return this.seatService.getAllSeats(query);
  }
}
