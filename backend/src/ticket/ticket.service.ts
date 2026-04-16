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
import { eq, and } from 'drizzle-orm';
import { flight, route, airline, aircraft, seat, seat_class, ticket } from 'src/db/schema';
import { CacheInvalidationService } from 'src/common/services/cache-invalidation.service';

@Injectable()
export class TicketService {
  constructor(
    private ticketRepo: TicketRepository,
    private passengerRepo: PassengerRepository,
    private bookingRepo: BookingRepository,
    private cacheInvalidation: CacheInvalidationService,
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

    // Get flight_id from booking
    const flightId = existingBooking.flight_id;

    const { passenger: passengerData, ...ticketFields } = data;

    return await this.db.transaction(async (tx: any) => {
      // Get flight to find aircraft_id
      const flightData = await tx.query.flight.findFirst({
        where: eq(flight.id, flightId),
      });

      if (!flightData) {
        throw new NotFoundException('Flight not found');
      }

      // Find all seats on this aircraft
      const allAircraftSeats = await tx.query.seat.findMany({
        where: eq(seat.aircraft_id, flightData.aircraft_id),
      });

      if (allAircraftSeats.length === 0) {
        throw new NotFoundException('No seats available on this aircraft');
      }

      // Get already booked seat IDs for this flight with row-level lock
      // This prevents concurrent transactions from booking the same seat
      const bookedTickets = await tx
        .select({ seat_id: ticket.seat_id })
        .from(ticket)
        .where(eq(ticket.flight_id, flightId))
        .for('update');

      const bookedSeatIds = new Set(bookedTickets.map(t => t.seat_id));

      // Filter out booked seats
      const availableSeats = allAircraftSeats.filter(s => !bookedSeatIds.has(s.id));

      if (availableSeats.length === 0) {
        throw new ForbiddenException('No available seats on this flight');
      }

      // Randomly select an available seat
      const randomIndex = Math.floor(Math.random() * availableSeats.length);
      const seatData = availableSeats[randomIndex];

      const [newPassenger] = await this.passengerRepo.createOne(passengerData, tx);

      const price = await this.calculatePrice(flightId, seatData.id, tx);

      const ticketData: ITicket = {
        price,
        currency: 'USD',
        booking_id: ticketFields.booking_id,
        flight_id: flightId,
        seat_id: seatData.id,
        passenger_id: newPassenger.id,
      };

      const [newTicket] = await this.ticketRepo.createOne(ticketData, tx);

      return this.ticketRepo.findOneById(newTicket.id);
    }).then(async (result) => {
      // Invalidate ticket and booking cache after transaction commits
      await this.cacheInvalidation.invalidateTicket(result.id, data.booking_id, flightId);
      return result;
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
      const newSeatId = data.seat_id;
      
      // Use transaction with locking when changing seats
      return await this.db.transaction(async (tx: any) => {
        // Lock all tickets for this flight to prevent concurrent seat changes
        await tx
          .select({ seat_id: ticket.seat_id })
          .from(ticket)
          .where(eq(ticket.flight_id, existing.flight_id))
          .for('update');

        // Check if the new seat is already taken
        const seatTaken = await tx.query.ticket.findFirst({
          where: and(
            eq(ticket.flight_id, existing.flight_id),
            eq(ticket.seat_id, newSeatId),
          ),
        });

        if (seatTaken) {
          throw new ForbiddenException('This seat is already taken');
        }

        updateData.seat_id = newSeatId;
        updateData.price = await this.calculatePrice(existing.flight_id, newSeatId, tx);

        const rows = await this.ticketRepo.updateOneById(id, updateData, tx);

        if (rows.length === 0) {
          throw new NotFoundException('Ticket not found');
        }

        return rows[0];
      }).then(async (result) => {
        // Invalidate cache after transaction commits
        await this.cacheInvalidation.invalidateTicket(id, existing.booking_id, existing.flight_id);
        return result;
      });
    }

    // Simple update without seat change (no locking needed)
    const rows = await this.ticketRepo.updateOneById(id, updateData);

    if (rows.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    // Invalidate cache
    await this.cacheInvalidation.invalidateTicket(id, existing.booking_id, existing.flight_id);
    
    return rows[0];
  }

  async deleteTicketById(id: number) {
    const existing = await this.ticketRepo.findOneRawById(id);
    
    const rows = await this.ticketRepo.deleteOneById(id);

    if (rows.length === 0) {
      throw new NotFoundException('Ticket not found');
    }

    // Invalidate cache
    if (existing) {
      await this.cacheInvalidation.invalidateTicket(id, existing.booking_id, existing.flight_id);
    }
  }
}
