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
import { TicketService } from './ticket.service';
import { GetTicketsQueryDto } from './dto/get-tickets.dto';
import { PatchTicketDto } from './dto/patch-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CacheTTL } from '@nestjs/cache-manager';
import { CacheLoggingInterceptor } from 'src/common/interceptors/cache-logging.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/user/types/user.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.interface';

@Controller('ticket')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get()
  getTickets(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GetTicketsQueryDto,
  ) {
    return this.ticketService.getAllTickets(user, query);
  }

  @UseInterceptors(CacheLoggingInterceptor)
  @CacheTTL(60_000)
  @Roles(UserRole.ADMIN, UserRole.USER)
  @Get(':id')
  getTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ticketService.getTicketById(user, id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.USER)
  createTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTicketDto,
  ) {
    return this.ticketService.createTicket(user, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  updateTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PatchTicketDto,
  ) {
    return this.ticketService.updateTicketById(user, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  deleteTicket(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.deleteTicketById(id);
  }
}
