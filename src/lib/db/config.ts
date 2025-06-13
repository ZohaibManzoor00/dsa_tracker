import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Get the database URL from environment variables
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance
export const db = drizzle(sql); 