import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: 'postgres://postgres:postgres@localhost:5433/airlines_test',
  },
  dialect: 'postgresql',
});
