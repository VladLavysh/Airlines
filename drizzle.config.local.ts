import { defineConfig } from 'drizzle-kit';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env', override: false });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    url:
      process.env.DATABASE_URL?.replace('db:', 'localhost:') ||
      `postgres://${process.env.DATABASE_USER || 'postgres'}:${process.env.DATABASE_PASSWORD || 'postgres'}@localhost:${process.env.DATABASE_PORT || 5432}/${process.env.DATABASE_NAME || 'airlines'}`,
  },
  dialect: 'postgresql',
});
