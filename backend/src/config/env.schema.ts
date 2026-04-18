import { z } from 'zod';

export const EnvSchema = z.object({
  // Server Configuration
  SERVER_PORT: z.coerce.number().default(4000),
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

  // JWT Configuration
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRATION: z.string().default('1h'),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),

  // AI integration
  OLLAMA_API_URL: z.string().min(1),
  OLLAMA_MODEL: z.string().min(1),
});

export type Env = z.infer<typeof EnvSchema>;
