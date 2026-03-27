import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import type { CodeStyle } from '../lib/types.js';

export const contextColumns = {
    instructions: text('instructions'),
    codeStyles: jsonb('code_styles').$type<CodeStyle[]>().notNull().default([]),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
};

// Ghost table used only for type inference — not a real migration target.
export const contextTable = pgTable('context', contextColumns);
