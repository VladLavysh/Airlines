import { z } from 'zod';

export const EnvSchema = z.object({
  // Server Configuration
  SERVER_PORT: z.coerce.number().default(3000),
  SERVER_NODE_ENV: z.enum(['development', 'production']).default('development'),
  SERVER_CORS_ORIGIN: z.string().min(1),

  // Database Configuration
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  DATABASE_URL: z.string().min(1),

  // PostgreSQL specific variables (required by postgres image)
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  // Redis Configuration
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type Env = z.infer<typeof EnvSchema>;
