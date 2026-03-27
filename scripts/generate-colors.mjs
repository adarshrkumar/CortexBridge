import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const colorsPath = join(__dirname, '../colors.json');

const paths = {
    css: [
        '../mcp/public/colors.css',
    ],
    scss: [
        '../app/src/styles/variables/colors.scss',
    ],
};

function buildCssVars(colors) {
    const light = Object.entries(colors).map(([name, { light }]) => `    --color-${name}: ${light};`).join('\n');
    const dark = Object.entries(colors).map(([name, { dark }]) => `        --color-${name}: ${dark};`).join('\n');
    return `:root {\n${light}\n\n    @media (prefers-color-scheme: dark) {\n${dark}\n    }\n}`;
}

function buildScssVars(colors) {
    const light = Object.entries(colors).map(([name, { light }]) => `$color-${name}-light: ${light};`).join('\n');
    const dark = Object.entries(colors).map(([name, { dark }]) => `$color-${name}-dark: ${dark};`).join('\n');
    return `${light}\n\n${dark}`;
}

export default function run() {
    const colors = JSON.parse(readFileSync(colorsPath, 'utf-8'));
    const css = buildCssVars(colors);
    const scss = `${buildScssVars(colors)}\n\n${buildCssVars(colors)}`;
    paths.css.forEach(p => writeFileSync(join(__dirname, p), css + '\n'));
    paths.scss.forEach(p => writeFileSync(join(__dirname, p), scss + '\n'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run();
}
