import { defineConfig } from 'drizzle-kit';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.test', override: true });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/airlines_test',
  },
  dialect: 'postgresql',
});
