import { z } from 'zod';
import { contextTable } from '../../../db/dull-schema.js';

export const codeStyleSchema = z.object({
    type: z.string(),
    rule: z.string(),
});

export type CodeStyle = z.infer<typeof codeStyleSchema>;
export type ProjectContext = typeof contextTable.$inferSelect;
