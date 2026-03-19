import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, timestamp, index, unique, decimal, date, uniqueIndex } from 'drizzle-orm/pg-core';

export const airline = pgTable(
  'airline',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    iata_code: varchar('iata_code', { length: 3 }).notNull().unique(),
    country: varchar('country', { length: 32 }).notNull(),
    price_multiplier: decimal('price_multiplier', { precision: 4, scale: 2 }).notNull().default('1.00'),
  }
);

export const aircraft = pgTable(
  'aircraft',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    registration_number: varchar('registration_number', { length: 16 }).notNull().unique(),
    manufacturer: varchar('manufacturer', { length: 64 }).notNull(),
    year: integer('year').notNull(),
    price_multiplier: decimal('price_multiplier', { precision: 4, scale: 2 }).notNull().default('1.00'),

    airline_id: integer('airline_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
  },
  (table) => [index('aircraft_airline_id_idx').on(table.airline_id)],
);
export const aircraftRelations = relations(aircraft, ({ one, many }) => ({
  airline: one(airline, {
    fields: [aircraft.airline_id],
    references: [airline.id],
  }),
  seats: many(seat),
}));

export const seat_class = pgTable(
  'seat_class',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 20 }).notNull(),
    price_multiplier: decimal('price_multiplier', { precision: 4, scale: 2 }).notNull(),
  }
);

export const seat = pgTable(
  'seat',
  {
    id: serial('id').primaryKey(),
    seat_number: varchar('seat_number', { length: 3 }).notNull(),

    seat_class_id: integer('seat_class_id')
      .notNull()
      .references(() => seat_class.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
    aircraft_id: integer('aircraft_id')
      .notNull()
      .references(() => aircraft.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade'
      })
  },
  (table) => [
    unique('unique_seat_number_per_aircraft').on(table.seat_number, table.aircraft_id),
    index('seat_seat_class_id_idx').on(table.seat_class_id),
    index('seat_aircraft_id_idx').on(table.aircraft_id),
  ]
);
export const seatRelations = relations(seat, ({ one, many }) => ({
  aircraft: one(aircraft, {
    fields: [seat.aircraft_id],
    references: [aircraft.id],
  }),
  class: one(seat_class, {
    fields: [seat.seat_class_id],
    references: [seat_class.id],
  }),
  tickets: many(ticket),
}));

export const route = pgTable(
  'route',
  {
    id: serial('id').primaryKey(),
    departure_airport: varchar('departure_airport', { length: 32 }).notNull(),
    arrival_airport: varchar('arrival_airport', { length: 32 }).notNull(),
    distance: integer('distance').notNull(),
    base_price: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  }
)

export const flight = pgTable(
  'flight',
  {
    id: serial('id').primaryKey(),
    departure_time: timestamp('departure_time').notNull(),
    arrival_time: timestamp('arrival_time').notNull(),
    flight_status: varchar('flight_status', { length: 32 }).notNull(),

    route_id: integer('route_id')
      .notNull()
      .references(() => route.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
      }),
    aircraft_id: integer('aircraft_id')
      .notNull()
      .references(() => aircraft.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
      }),
    airline_id: integer('airline_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict'
      })
  },
  (table) => [
    index('flight_route_id_idx').on(table.route_id),
    index('flight_aircraft_id_idx').on(table.aircraft_id),
    index('flight_airline_id_idx').on(table.airline_id)
  ]
)
export const flightRelations = relations(flight, ({ one, many }) => ({
  route: one(route, {
    fields: [flight.route_id],
    references: [route.id],
  }),
  aircraft: one(aircraft, {
    fields: [flight.aircraft_id],
    references: [aircraft.id],
  }),
  airline: one(airline, {
    fields: [flight.airline_id],
    references: [airline.id],
  }),
  tickets: many(ticket),
}));

export const user = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: varchar('role', { length: 16 }).notNull().default('user'),
    first_name: varchar('first_name', { length: 64 }).notNull(),
    last_name: varchar('last_name', { length: 64 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    deleted_at: timestamp('deleted_at')
  }
);
export const userRelations = relations(user, ({ many }) => ({
  bookings: many(booking),
}));

export const refresh_token = pgTable(
  'refresh_token',
  {
    id: serial('id').primaryKey(),
    token: varchar('token', { length: 500 }).notNull().unique(),
    user_id: integer('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    revoked_at: timestamp('revoked_at'),
  },
  (table) => [index('refresh_token_token_idx').on(table.token), index('refresh_token_user_id_idx').on(table.user_id)],
);
export const refreshTokenRelations = relations(refresh_token, ({ one }) => ({
  user: one(user, {
    fields: [refresh_token.user_id],
    references: [user.id],
  }),
}));

export const passenger = pgTable(
  'passenger',
  {
    id: serial('id').primaryKey(),
    first_name: varchar('first_name', { length: 64 }).notNull(),
    last_name: varchar('last_name', { length: 64 }).notNull(),
    passport_number: varchar('passport_number', { length: 20 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    date_of_birth: date('date_of_birth').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
  }
);

export const booking = pgTable(
  'booking',
  {
    id: serial('id').primaryKey(),
    status: varchar('status', { length: 16 }).notNull().default('pending'),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),

    user_id: integer('user_id')
      .notNull()
      .references(() => user.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => [
    index('booking_user_id_idx').on(table.user_id),
  ]
);
export const bookingRelations = relations(booking, ({ one, many }) => ({
  user: one(user, {
    fields: [booking.user_id],
    references: [user.id],
  }),
  tickets: many(ticket),
}));

export const ticket = pgTable(
  'ticket',
  {
    id: serial('id').primaryKey(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('USD'),

    booking_id: integer('booking_id')
      .notNull()
      .references(() => booking.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    flight_id: integer('flight_id')
      .notNull()
      .references(() => flight.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
    seat_id: integer('seat_id')
      .notNull()
      .references(() => seat.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
    passenger_id: integer('passenger_id')
      .notNull()
      .references(() => passenger.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
  },
  (table) => [
    index('ticket_booking_id_idx').on(table.booking_id),
    index('ticket_flight_id_idx').on(table.flight_id),
    index('ticket_seat_id_idx').on(table.seat_id),
    index('ticket_passenger_id_idx').on(table.passenger_id),
  ]
);
export const ticketRelations = relations(ticket, ({ one }) => ({
  booking: one(booking, {
    fields: [ticket.booking_id],
    references: [booking.id],
  }),
  flight: one(flight, {
    fields: [ticket.flight_id],
    references: [flight.id],
  }),
  seat: one(seat, {
    fields: [ticket.seat_id],
    references: [seat.id],
  }),
  passenger: one(passenger, {
    fields: [ticket.passenger_id],
    references: [passenger.id],
  }),
}));

export const passengerRelations = relations(passenger, ({ many }) => ({
  tickets: many(ticket),
}));