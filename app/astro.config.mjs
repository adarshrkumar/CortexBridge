// @ts-check
import { defineConfig } from 'astro/config';
import run from '../styles/scripts/generate-colors.mjs';

run();

// https://astro.build/config
export default defineConfig({});
