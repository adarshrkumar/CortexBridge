import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ruleFiles = fs.readdirSync(`${__dirname}/rules`).filter(f => f.endsWith('.js') && !f.startsWith('_'));

export const rules = Object.fromEntries(
    await Promise.all(
        ruleFiles.map(async file => {
            const name = file.replace('.js', '');
            const mod = await import(`./rules/${file}`);
            return [name, mod.default];
        })
    )
);

export const ruleConfigs = Object.fromEntries(
    Object.keys(rules).map(key => [`custom/${key}`, 'error'])
);
