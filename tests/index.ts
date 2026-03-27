import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const client = new Client({ name: 'test-client', version: '0.0.1' });

const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'src/index.ts'],
});

await client.connect(transport);

// list tools
const { tools } = await client.listTools();
console.assert(tools.length > 0, 'expected at least one tool');
console.log('tools:', tools.map(t => t.name));

// call get-instructions
const result = await client.callTool({
    name: 'get-instructions',
    arguments: { project_id: 'test-project' },
}) as CallToolResult;
console.assert(result.content.length > 0, 'expected content in response');
const first = result.content[0];
console.log('get-instructions:', first.type === 'text' ? first.text : first.type);

await client.close();
console.log('all tests passed');
