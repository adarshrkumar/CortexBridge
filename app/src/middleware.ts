import { defineMiddleware } from 'astro:middleware';
import { requireAuth } from './lib/auth';

const authRoutes = ['/account/login', '/account/register', '/account/logout'];

export const onRequest = defineMiddleware(async (context, next) => {
    if (authRoutes.includes(context.url.pathname)) {
        return next();
    }
    return await requireAuth(context) ?? next();
});
