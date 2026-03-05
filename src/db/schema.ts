import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { index } from 'drizzle-orm/pg-core';

export const airline = pgTable('airline', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  iata_code: varchar('iata_code', { length: 3 }).notNull().unique(),
  country: varchar('country', { length: 32 }).notNull(),
});

export const aircraft = pgTable(
  'aircraft',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 64 }).notNull(),
    registration_number: varchar('registration_number', { length: 16 }).notNull().unique(),
    manufacturer: varchar('manufacturer', { length: 64 }).notNull(),
    year: integer('year').notNull(),
    total_seats: integer('total_seats').notNull(),

    airline_id: integer('airline_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'restrict',
      }),
  },
  (table) => [index('aircraft_airline_id_idx').on(table.airline_id)],
);

export const route = pgTable(
  'route',
  {
    id: serial('id').primaryKey(),
    departure_airport: varchar('departure_airport', { length: 32 }).notNull(),
    arrival_airport: varchar('arrival_airport', { length: 32 }).notNull(),
    distanceKM: integer('distance').notNull()
  }
)

export const flight = pgTable(
  'flight',
  {
    id: serial('id').primaryKey(),
    departure_time: timestamp('departure_time').notNull(),
    arrival_time: timestamp('arrival_time').notNull(),
    status: varchar('arrival_airport', { length: 32 }).notNull(),

    route_id: integer('route_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
      }),
    aircraft_id: integer('aircraft_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
      }),
    airline_id: integer('airline_id')
      .notNull()
      .references(() => airline.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade'
      })
  },
  (table) => [
    index('flight_route_id_idx').on(table.route_id),
    index('flight_aircraft_id_idx').on(table.aircraft_id),
    index('flight_airline_id_idx').on(table.airline_id)
  ]
)
