import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar, integer, timestamp, index, unique, decimal } from 'drizzle-orm/pg-core';

export const airline = pgTable(
  'airline',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    iata_code: varchar('iata_code', { length: 3 }).notNull().unique(),
    country: varchar('country', { length: 32 }).notNull(),
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
export const seatRelations = relations(seat, ({ one }) => ({
  aircraft: one(aircraft, {
    fields: [seat.aircraft_id],
    references: [aircraft.id],
  }),
  class: one(seat_class, {
    fields: [seat.seat_class_id],
    references: [seat_class.id],
  }),
}));

export const route = pgTable(
  'route',
  {
    id: serial('id').primaryKey(),
    departure_airport: varchar('departure_airport', { length: 32 }).notNull(),
    arrival_airport: varchar('arrival_airport', { length: 32 }).notNull(),
    distance: integer('distance').notNull()
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
export const flightRelations = relations(flight, ({ one }) => ({
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
}));

export const user = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    role: varchar('role', { length: 16 }).notNull(),
    first_name: varchar('first_name', { length: 64 }).notNull(),
    last_name: varchar('last_name', { length: 64 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    deleted_at: timestamp('deleted_at')
  }
);
// export const userRelations = relations(user, ({ many }) => ({
//   bookings: many(booking),
// }));

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
