import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_CONNECTION_STRING as string,
  },
} satisfies Config;
