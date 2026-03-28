import { defineMiddleware } from 'astro:middleware';
import { requireAuth, alreadyAuthed } from './lib/auth';

const guestOnlyRoutes = ['/account/login', '/account/register'];
const authOnlyRoutes = ['/account/logout'];

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;

    if (guestOnlyRoutes.includes(pathname)) {
        return await alreadyAuthed(context) ?? next();
    }

    if (authOnlyRoutes.includes(pathname)) {
        return await requireAuth(context) ?? next();
    }

    return await requireAuth(context) ?? next();
});
