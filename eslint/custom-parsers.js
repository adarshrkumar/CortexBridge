import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parsersDir = path.join(__dirname, './parsers');

const parserFiles = fs.readdirSync(parsersDir).filter(f => f.endsWith('.js'));

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
