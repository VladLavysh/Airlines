import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TicketRepository } from './ticket.repository';
import { PassengerRepository } from 'src/passenger/passenger.repository';
import { BookingRepository } from 'src/booking/booking.repository';
import { IGetAllTickets } from './types/get-all-tickets.interface';
import { ITicket } from './types/ticket.interface';
import { UserRole } from 'src/user/types/user.interface';
import type { AuthenticatedUser } from 'src/auth/types/authenticated-user.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { PatchTicketDto } from './dto/patch-ticket.dto';
import { eq } from 'drizzle-orm';
import { flight, route, airline, aircraft, seat, seat_class } from 'src/db/schema';

@Injectable()
export class TicketService {
  constructor(
    private ticketRepo: TicketRepository,
    private passengerRepo: PassengerRepository,
    private bookingRepo: BookingRepository,
    @Inject('DB') private readonly db: any,
  ) {}

  getAllTickets(user: AuthenticatedUser, data: IGetAllTickets) {
    if (user.role === UserRole.ADMIN) {
      return this.ticketRepo.findAll(data);
    }

    return this.ticketRepo.findAllByUserBookings(user.id, data);
  }

  async getTicketById(user: AuthenticatedUser, id: number) {
    const ticket = await this.ticketRepo.findOneRawById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (user.role !== UserRole.ADMIN && ticket.booking?.user_id !== user.id) {
      throw new ForbiddenException('You can only view tickets from your own bookings');
    }

    return this.ticketRepo.findOneById(id);
  }

  async calculatePrice(flightId: number, seatId: number, tx?: any): Promise<string> {
    const dbClient = tx || this.db;

    const flightData = await dbClient.query.flight.findFirst({
      where: eq(flight.id, flightId),
    });

    if (!flightData) {
      throw new NotFoundException('Flight not found');
    }

    const [routeData] = await dbClient
      .select({ base_price: route.base_price })
      .from(route)
      .where(eq(route.id, flightData.route_id));

    const [airlineData] = await dbClient
      .select({ price_multiplier: airline.price_multiplier })
      .from(airline)
      .where(eq(airline.id, flightData.airline_id));

    const [aircraftData] = await dbClient
      .select({ price_multiplier: aircraft.price_multiplier })
      .from(aircraft)
      .where(eq(aircraft.id, flightData.aircraft_id));

    const seatData = await dbClient.query.seat.findFirst({
      where: eq(seat.id, seatId),
    });

    if (!seatData) {
      throw new NotFoundException('Seat not found');
    }

    const [seatClassData] = await dbClient
      .select({ price_multiplier: seat_class.price_multiplier })
      .from(seat_class)
      .where(eq(seat_class.id, seatData.seat_class_id));

    const basePrice = parseFloat(routeData.base_price);
    const airlineMult = parseFloat(airlineData.price_multiplier);
    const aircraftMult = parseFloat(aircraftData.price_multiplier);
    const seatClassMult = parseFloat(seatClassData.price_multiplier);

    const price = basePrice * airlineMult * aircraftMult * seatClassMult;

    return price.toFixed(2);
  }

  async createTicket(user: AuthenticatedUser, data: CreateTicketDto) {
    const existingBooking = await this.bookingRepo.findOneById(data.booking_id);

    if (!existingBooking) {
      throw new NotFoundException('Booking not found');
    }

    if (user.role !== UserRole.ADMIN && existingBooking.user?.id !== user.id) {
      throw new ForbiddenException('You can only add tickets to your own bookings');
    }

    const { passenger: passengerData, ...ticketFields } = data;

    return await this.db.transaction(async (tx: any) => {
      const [newPassenger] = await this.passengerRepo.createOne(passengerData, tx);

      const price = await this.calculatePrice(ticketFields.flight_id, ticketFields.seat_id, tx);

      const ticketData: ITicket = {
        price,
        currency: 'USD',
        booking_id: ticketFields.booking_id,
        flight_id: ticketFields.flight_id,
        seat_id: ticketFields.seat_id,
        passenger_id: newPassenger.id,
      };

      const [newTicket] = await this.ticketRepo.createOne(ticketData, tx);

      return this.ticketRepo.findOneById(newTicket.id);
    });
  }

  async updateTicketById(user: AuthenticatedUser, id: number, data: PatchTicketDto) {
    const existing = await this.ticketRepo.findOneRawById(id);

    if (!existing) {
      throw new NotFoundException('Ticket not found');
    }

    if (user.role !== UserRole.ADMIN && existing.booking?.user_id !== user.id) {
      throw new ForbiddenException('You can only update tickets from your own bookings');
    }

    const updateData: Partial<ITicket> = {};
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.seat_id !== undefined) {
      updateData.seat_id = data.seat_id;
      updateData.price = await this.calculatePrice(existing.flight_id, data.seat_id);
    }

    const rows = await this.ticketRepo.updateOneById(id, updateData);

    if (rows.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    return rows[0];
  }

  async deleteTicketById(id: number) {
    const rows = await this.ticketRepo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Ticket not found');
    }
  }
}
