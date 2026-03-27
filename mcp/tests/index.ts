import { execSync } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

function git(cmd: string): string {
    return execSync(cmd, { encoding: 'utf8' }).trim();
}

const gitState = {
    branch: git('git rev-parse --abbrev-ref HEAD'),
    commit: git('git rev-parse HEAD'),
    remote: (() => {
        try { return git('git remote get-url origin'); } catch { return undefined; }
    })(),
};

const client = new Client({ name: 'test-client', version: '0.0.1' });

const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/server/index.ts'],
});

await client.connect(transport);

// list tools
const { tools } = await client.listTools();
console.assert(tools.length > 0, 'expected at least one tool');
console.log('tools:', tools.map(t => t.name));

// call get-instructions
const result = await client.callTool({
    name: 'get-instructions',
    arguments: { project: 'test-project', git: gitState },
}) as CallToolResult;
console.assert(result.content.length > 0, 'expected content in response');
const first = result.content[0];
console.log('get-instructions:', first.type === 'text' ? first.text : first.type);

// call get-code-styles
const styles = await client.callTool({
    name: 'get-code-styles',
    arguments: { project: 'test-project', git: gitState },
}) as CallToolResult;
console.assert(styles.content.length > 0, 'expected content in styles response');
const firstStyle = styles.content[0];
console.log('get-code-styles:', firstStyle.type === 'text' ? firstStyle.text : firstStyle.type);

await client.close();
console.log('all tests passed');
