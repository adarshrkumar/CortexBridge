import { toNodeHandler } from 'better-auth/node';
import express from 'express';

import { auth } from '../../shared/auth/index.js';

import config from '../../config.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const domain = new URL(config.url).hostname;
const url = process.env.BETTER_AUTH_URL ?? `https://${config.subdomains.auth}.${domain}`;

const app = express();
app.use(express.json());

app.all('/api/auth/*splat', toNodeHandler(auth));

app.all('/*splat', (req, res) => {
    res.status(302).redirect(`https://${config.subdomains.app}.${domain}${`/${req.originalUrl}`.replaceAll('//', '/')}`);
});


if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Auth service listening on http://localhost:${PORT}`);
        console.log(`  Auth: ${url}/api/auth`);
    });
}

export default app;
