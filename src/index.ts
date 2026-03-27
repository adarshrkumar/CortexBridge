import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
    name: 'cortexbridge',
    version: '0.1.0',
});

server.tool(
    'get-instructions',
    'Fetch project instructions for the current project',
    {
        project_id: z.string().describe('The project ID from .cortexconfig'),
    },
    async ({ project_id }) => {
        // TODO: authenticate via Better Auth
        // TODO: fetch instructions from cloud

        return {
            content: [
                {
                    type: 'text',
                    text: `Instructions for project: ${project_id}`,
                },
            ],
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
