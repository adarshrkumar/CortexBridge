import { auth } from '../../../../shared/auth/index.js';

interface RequestContext {
    request: Request;
    redirect: (path: string) => Response;
}

export async function isLoggedIn(headers: Headers): Promise<boolean> {
    const session = await auth.api.getSession({ headers });
    return session !== null;
}

export async function requireAuth(context: RequestContext): Promise<Response | void> {
    const session = await auth.api.getSession({ headers: context.request.headers });
    if (!session) {
        return context.redirect('/account/login');
    }
}
