import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import { auth } from '../../shared/auth/index.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

const app = express();
app.use(express.json());

app.all('/api/auth/*splat', toNodeHandler(auth));

if (!process.env.VERCEL) {
    const url = process.env.BETTER_AUTH_URL ?? `http://localhost:${PORT}`;
    app.listen(PORT, () => {
        console.log(`Auth service listening on http://localhost:${PORT}`);
        console.log(`  Auth: ${url}/api/auth`);
    });
}

export default app;
