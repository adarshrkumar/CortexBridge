import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 

const parserFiles = fs.readdirSync(`${__dirname}/parsers`).filter(f => f.endsWith('.js') && !f.startsWith('_'));

export default Object.fromEntries(
    await Promise.all(
        parserFiles.map(async file => {
            const name = file.replace('.js', '').replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            const parseFunction = (await import(`./parsers/${file}`)).default;
            const meta = {
                name: name.replace(/([A-Z])/g, '-$1').toLowerCase(),
                version: '1.0.0'
            };
            return [
                name,
                {
                    parseForESLint: parseFunction,
                    meta
                }
            ];
        })
    )
);
