import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';
import { contextColumns } from './dull-schema.js';
import type { ProjectContext } from '../lib/types.js';

export const organization = pgTable('organization', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    logo: text('logo'),
    website: text('website'),
    ownerId: text('owner_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    members: text('members').array().notNull().default([]),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
});

export const project = pgTable('project', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull().unique(),
    organizationId: text('organization_id')
        .notNull()
        .references(() => organization.id, { onDelete: 'cascade' }),
    ...contextColumns,
    branches: jsonb('branches').$type<Record<string, ProjectContext>>().notNull().default({}),
});
