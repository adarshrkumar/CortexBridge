import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mixinsPath = join(__dirname, '../mixins.json');

const paths = [
    '../../app/src/styles/mixins.scss',
];

export default function run() {
    const { breakpoints = {} } = JSON.parse(readFileSync(mixinsPath, 'utf-8'));

    const str = Object.entries(breakpoints).map(([name, value]) => (
`@mixin ${name} {
    @media (min-width: ${value}) {
        @content;
    }
}`
    )).join('\n\n');

    paths.forEach(p => writeFileSync(join(__dirname, p), `${str}\n`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run();
}
