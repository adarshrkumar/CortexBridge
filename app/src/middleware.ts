import { defineMiddleware } from 'astro:middleware';
import { isLoggedIn } from '../../shared/auth/index.js';

const loginPageRoutes = ['/account/login', '/account/register'];

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url;
    const loggedIn = await isLoggedIn(context.request.headers);

    if (loginPageRoutes.includes(pathname)) {
        if (loggedIn) {
            return context.redirect('/');
        }
        return next();
    }

    if (!loggedIn) {
        return context.redirect('/account/login');
    }
    return next();
});
