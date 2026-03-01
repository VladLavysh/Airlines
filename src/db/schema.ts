import { pgTable, serial, varchar, integer } from 'drizzle-orm/pg-core';
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