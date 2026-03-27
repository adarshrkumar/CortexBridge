// @ts-check
import { defineConfig } from 'astro/config';
import run from '../scripts/generate-colors.mjs';

run();

// https://astro.build/config
export default defineConfig({});
