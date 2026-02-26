import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';

export const airline = pgTable('airline', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  iata_code: varchar('iata_code', { length: 3 }).notNull().unique(),
  country: varchar('country', { length: 32 }).notNull(),
});
