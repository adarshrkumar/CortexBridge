import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';

if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required');
}

export const auth = betterAuth({
    secret : process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    // TODO: replace with a real database adapter (e.g. Drizzle, Prisma)
    // See: https://www.better-auth.com/docs/adapters
    database: {
        provider: 'sqlite',
        url: process.env.DATABASE_URL ?? ':memory:',
    },
    plugins: [
        jwt(),
        oauthProvider({
            loginPage: '/sign-in',
            consentPage: '/consent',
            scopes: ['openid', 'profile', 'email', 'offline_access'],
        }),
    ],
});
