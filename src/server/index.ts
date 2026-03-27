import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
    name: 'cortexbridge',
    version: '0.1.0',
});

const gitState = z.object({
    branch: z.string().describe('git rev-parse --abbrev-ref HEAD'),
    commit: z.string().describe('git rev-parse HEAD'),
    remote: z.string().optional().describe('git remote get-url origin'),
}).describe('Current git state');

server.registerTool(
    'get-instructions',
    {
        description: 'Fetch instructions for the current org, project, and branch',
        inputSchema: {
            project: z.string().describe('The project ID from .cortexconfig'),
            git: gitState,
        },
    },
    async ({ project, git }) => {
        // TODO: authenticate via Better Auth (org resolved from session)
        const org = 'default-org';
        // TODO: fetch instructions from cloud

        return {
            content: [
                {
                    type: 'text',
                    text: `Instructions for ${org}/${project}@${git.branch}`,
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
            project: z.string().describe('The project ID from .cortexconfig'),
            git: gitState,
        },
    },
    async ({ project, git }) => {
        // TODO: authenticate via Better Auth (org resolved from session)
        const org = 'default-org';
        // TODO: fetch code styles from cloud

        return {
            content: [
                {
                    type: 'text',
                    text: `Code styles for ${org}/${project}@${git.branch}`,
                },
            ],
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
