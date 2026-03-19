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
import { BookingService } from './booking.service';
import { GetBookingsQueryDto } from './dto/get-bookings.dto';
import { PatchBookingDto } from './dto/patch-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.interface';

@Controller('booking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get()
  getBookings(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetBookingsQueryDto,
  ) {
    return this.bookingService.getAllBookings(user, query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  getBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookingService.getBookingById(user, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  createBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(user.id, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  updateBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchBookingDto,
  ) {
    return this.bookingService.updateBookingById(user, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.deleteBookingById(id);
  }
}
