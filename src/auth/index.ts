import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { db } from '../db/index';
import * as schema from '../db/schema';

if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required');
}

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    plugins: [
        jwt(),
        oauthProvider({
            loginPage: '/sign-in',
            consentPage: '/consent',
            scopes: ['openid', 'profile', 'email', 'offline_access'],
        }),
    ],
});
