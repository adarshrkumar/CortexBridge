import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rulesDir = path.join(__dirname, './rules');

const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.js'));

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
