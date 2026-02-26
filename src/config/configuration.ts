import { EnvSchema } from './env.schema';

export default () => {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());

    process.exit(1); // fail-fast
  }

  return parsed.data;
};
