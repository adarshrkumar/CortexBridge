import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as mainSchema from      './schema.js';
import * as authSchema from './auth-schema.js';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema: { ...mainSchema, ...authSchema } });
