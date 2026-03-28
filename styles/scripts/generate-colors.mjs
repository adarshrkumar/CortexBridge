import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const colorsPath = join(__dirname, '../colors.json');

const paths = [
    '../../mcp/public/colors.css',
    '../../app/src/styles/variables/colors.scss',
];

const builders = {
    css: (colors) => (`
:root {
    ${Object.entries(colors).map(([name, { light }]) => (
        `--color-${name}: ${light};`
    )).join('\n    ')}

    @media (prefers-color-scheme: dark) {
        ${Object.entries(colors).map(([name, { dark }]) => (
            `--color-${name}: ${dark};`
        )).join('\n        ')}
    }
}
`.trim()),
    scss: (colors) => (`
${Object.entries(colors).map(([name, { light, dark }]) => (`
$color-${name}-light: ${light};
$color-${name}-dark: ${dark};
`.trim())).join('\n')}

:root {
    ${Object.entries(colors).map(([name]) => (
        `--color-${name}: #{$color-${name}-light};`
    )).join('\n    ')}

    @media (prefers-color-scheme: dark) {
        ${Object.entries(colors).map(([name]) => (
            `--color-${name}: #{$color-${name}-dark};`
        )).join('\n        ')}
    }
}
`.trim()),
};

export default function run() {
    const colors = JSON.parse(readFileSync(colorsPath, 'utf-8'));
    paths.forEach(p => {
        const ext = extname(p).slice(1);
        writeFileSync(join(__dirname, p), `${builders[ext](colors)}\n`);
    });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run();
}
