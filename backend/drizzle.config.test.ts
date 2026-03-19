import { defineConfig } from 'drizzle-kit';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.test', override: false });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url:
      process.env.DATABASE_URL?.replace('db:', 'localhost:') ||
      'postgres://postgres:postgres@localhost:5433/airlines_test',
  },
  dialect: 'postgresql',
});
