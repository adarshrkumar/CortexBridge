import { toNodeHandler } from 'better-auth/node';
import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';
import express from 'express';

import config from '../../config.js';
import { auth } from '../../shared/auth/index.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const domain = new URL(config.url).hostname;
const authURL = `https://${config.subdomains.auth}.${domain}`;

const trustedOrigins: string[] = auth.options.trustedOrigins ?? [];

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && trustedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

app.all('/api/auth/*splat', toNodeHandler(auth));

const metadataHandler = oauthProviderAuthServerMetadata(auth);

app.get('/.well-known/oauth-authorization-server', async (req, res) => {
    const webRes = await metadataHandler(Object.create(null, {
        method: { value: 'GET' },
        url: { value: `${authURL}${req.originalUrl}` },
        headers: { value: new Map() },
    }));
    res.status(webRes.status).json(await webRes.json());
});

app.get('/.well-known/oauth-authorization-server/api/auth', async (_req, res) => {
    const webRes = await metadataHandler(Object.create(null, {
        method: { value: 'GET' },
        url: { value: `${authURL}/.well-known/oauth-authorization-server` },
        headers: { value: new Map() },
    }));
    res.status(webRes.status).json(await webRes.json());
});

app.use((req, res) => {
    res.status(302).redirect(`https://${config.subdomains.app}.${domain}${`/${req.originalUrl}`.replaceAll('//', '/')}`);
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Auth service listening on http://localhost:${PORT}`);
        console.log(`  Auth: ${authURL}/api/auth`);
    });
}

export default app;
