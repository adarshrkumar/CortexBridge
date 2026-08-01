import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

import run from '../styles/scripts/generate-colors.mjs';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });
}

run();

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
});
