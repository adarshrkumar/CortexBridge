import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { db } from '../db/index.js';
import * as authSchema from '../db/auth-schema.js';

import config from '../../config.js';

if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required');
}

const domain = new URL(config.url).hostname;

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: `https://${config.subdomains.auth}.${domain}`,
    trustedOrigins: [
        `https://${config.subdomains.app}.${domain}`,
        `https://${config.subdomains.mcp}.${domain}`,
        'http://localhost:4321',
        'http://localhost:3000',
    ],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: authSchema.user,
            session: authSchema.session,
            account: authSchema.account,
            verification: authSchema.verification,
        },
    }),
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
            domain: `.${domain}`,
        },
        defaultCookieAttributes: {
            sameSite: 'none',
            secure: true,
        },
    },
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
    },
    plugins: [
        jwt(),
        oauthProvider({
            loginPage: `https://${config.subdomains.app}.${domain}/account/login`,
            consentPage: `https://${config.subdomains.app}.${domain}/account/login`,
            scopes: ['openid', 'profile', 'email', 'offline_access'],
            silenceWarnings: {
                oauthAuthServerConfig: true,
            },
        }),
    ],
});
