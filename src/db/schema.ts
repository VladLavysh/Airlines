import { pgTable, serial, varchar, integer, unique, bigint, decimal } from 'drizzle-orm/pg-core';
import { index } from 'drizzle-orm/pg-core';

export const airline = pgTable(
  'airline',
  {
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

export const seat_class = pgTable(
  'seat_class',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    name: varchar('name', { length: 20 }).notNull(),
    price_multiplier: decimal('price_multiplier', { precision: 4, scale: 2 }).notNull(),
  });

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
)