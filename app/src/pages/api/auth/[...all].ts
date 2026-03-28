import { auth } from '../../../../../shared/auth/index.js';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = (ctx) => auth.handler(ctx.request);
