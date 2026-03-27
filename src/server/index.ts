import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { execSync } from 'child_process';
import { z } from 'zod';

const server = new McpServer({
    name: 'cortexbridge',
    version: '0.1.0',
});

server.registerTool(
    'get-instructions',
    {
        description: 'Fetch instructions for the current org, project, and branch',
        inputSchema: {
            project: z.string().describe('The project from .cortexconfig'),
        },
    },
    async ({ project }) => {
        // TODO: authenticate via Better Auth (org resolved from session)
        const org = 'default-org';
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        // TODO: fetch instructions from cloud

        return {
            content: [
                {
                    type: 'text',
                    text: `Instructions for ${org}/${project}@${branch}`,
                },
            ],
        };
    }
);

server.registerTool(
    'get-code-styles',
    {
        description: 'Fetch code style rules for the current org, project, and branch',
        inputSchema: {
            project: z.string().describe('The project from .cortexconfig'),
        },
    },
    async ({ project }) => {
        // TODO: authenticate via Better Auth (org resolved from session)
        const org = 'default-org';
        const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        // TODO: fetch code styles from cloud

        return {
            content: [
                {
                    type: 'text',
                    text: `Code styles for ${org}/${project}@${branch}`,
                },
            ],
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
