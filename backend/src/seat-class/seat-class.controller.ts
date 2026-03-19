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
import { SeatClassService } from './seat-class.service';
import { GetSeatClassesQueryDto } from './dto/get-seat-classes.dto';
import { PatchSeatClassDto } from './dto/patch-seat-class.dto';
import { CreateSeatClassDto } from './dto/create-seat-class.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';

@Controller('seat-class')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class SeatClassController {
  constructor(private seatClassService: SeatClassService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Get()
  getSeatClasses(@Query() query: GetSeatClassesQueryDto) {
    return this.seatClassService.getAllSeatClasses(query);
  }

  @Post()
  createSeatClass(@Body() body: CreateSeatClassDto) {
    return this.seatClassService.createSeatClass(body);
  }

  @Patch(':id')
  updateSeatClass(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchSeatClassDto,
  ) {
    return this.seatClassService.updateSeatClassById(id, body);
  }

  @Delete(':id')
  deleteSeatClass(@Param('id', ParseIntPipe) id: number) {
    return this.seatClassService.deleteSeatClassById(id);
  }
}
