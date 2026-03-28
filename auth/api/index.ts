import { toNodeHandler } from 'better-auth/node';
import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';
import express from 'express';

import { auth } from '../../shared/auth/index.js';

import config from '../../config.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const domain = new URL(config.url).hostname;
const authURL = `https://${config.subdomains.auth}.${domain}`;

const app = express();
app.use(express.json());

app.all('/api/auth/*splat', toNodeHandler(auth));

const metadataHandler = oauthProviderAuthServerMetadata(auth);

app.get('/.well-known/oauth-authorization-server', async (req, res) => {
    const webRes = await metadataHandler(new Request(`${authURL}${req.originalUrl}`));
    res.status(webRes.status).json(await webRes.json());
});

app.get('/.well-known/oauth-authorization-server/api/auth', async (req, res) => {
    const webRes = await metadataHandler(new Request(`${authURL}/.well-known/oauth-authorization-server`));
    res.status(webRes.status).json(await webRes.json());
});

app.all('/*splat', (req, res) => {
    res.status(302).redirect(`https://${config.subdomains.app}.${domain}${`/${req.originalUrl}`.replaceAll('//', '/')}`);
});


if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Auth service listening on http://localhost:${PORT}`);
        console.log(`  Auth: ${authURL}/api/auth`);
    });
}

export default app;
