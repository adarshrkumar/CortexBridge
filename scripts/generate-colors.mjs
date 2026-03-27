import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const colorsPath = join(__dirname, '../colors.json');

const paths = {
    css: [
        '../mcp/public/colors.css',
    ],
    scss: [],
};

function build(colors) {
    return {
        css: [
            ':root {',
            ...Object.entries(colors).map(([name, { light }]) => `    --color-${name}: ${light};`),
            '',
            '    @media (prefers-color-scheme: dark) {',
            ...Object.entries(colors).map(([name, { dark }]) => `        --color-${name}: ${dark};`),
            '    }',
            '}',
        ],
        scss: [
            ...Object.entries(colors).map(([name, { light }]) => `$color-${name}-light: ${light};`),
            '',
            ...Object.entries(colors).map(([name, { dark }]) => `$color-${name}-dark: ${dark};`),
        ],
    };
}

export default function run() {
    const { css, scss } = build(JSON.parse(readFileSync(colorsPath, 'utf-8')));
    paths.css.forEach(p => writeFileSync(join(__dirname, p), css.join('\n') + '\n'));
    paths.scss.forEach(p => writeFileSync(join(__dirname, p), scss.join('\n') + '\n'));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run();
}
