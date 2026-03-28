import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensPath = join(__dirname, '../tokens.json');

const paths = [
    '../../app/src/styles/variables/tokens.scss',
];

export default function run() {
    const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

    const str = Object.entries(tokens).flatMap(([category, values]) =>
        Object.entries(values).map(([name, value]) => (
            `$${category}-${name}: ${value};`
        ))
    ).join('\n');

    paths.forEach(p => writeFileSync(join(__dirname, p), `${str}\n`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run();
}
