// @ts-check
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import run from '../styles/scripts/generate-colors.mjs';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });
}

run();

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: 'My Docs',
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
            sidebar: [
                {
                    label: 'Guides',
                    items: [
                        { label: 'Example Guide', slug: 'guides/example' },
                    ],
                },
                {
                    label: 'Reference',
                    autogenerate: { directory: 'reference' },
                },
            ],
        }),
    ],
});
