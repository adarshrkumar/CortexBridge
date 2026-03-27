import { toNodeHandler } from 'better-auth/integrations/node';
import { createMcpAuthClient } from 'better-auth/plugins/mcp/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { execSync } from 'child_process';
import { z } from 'zod';
import { auth } from '../auth/index.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const BASE_URL = process.env.BETTER_AUTH_URL ?? `http://localhost:${PORT}`;

const app = createMcpExpressApp({ host: '0.0.0.0' });

// Mount the Better Auth OAuth 2.1 authorization server at /api/auth.
// This serves all OAuth endpoints: /authorize, /token, /userinfo, /jwks,
// /.well-known/oauth-authorization-server, etc.
app.all('/api/auth/*splat', toNodeHandler(auth));

// MCP auth client — verifies bearer tokens issued by the auth server above.
const mcpAuth = createMcpAuthClient({ authURL: BASE_URL });

// OAuth discovery endpoints required by the MCP spec.
// Clients hit these to locate the authorization server and understand what
// this resource server protects.
app.get('/.well-known/oauth-authorization-server', (req, res) => {
    mcpAuth.discoveryHandler()(req as unknown as Request).then(r => {
        res.status(r.status);
        r.headers.forEach((v, k) => res.setHeader(k, v));
        r.text().then(body => res.end(body));
    });
});

app.get('/.well-known/oauth-protected-resource', (req, res) => {
    mcpAuth.protectedResourceHandler(BASE_URL)(req as unknown as Request).then(r => {
        res.status(r.status);
        r.headers.forEach((v, k) => res.setHeader(k, v));
        r.text().then(body => res.end(body));
    });
});

// MCP endpoint — protected by OAuth bearer token verification.
app.post('/mcp', mcpAuth.middleware(), async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', mcpAuth.middleware(), async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

function createMcpServer(): McpServer {
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
            // TODO: resolve org from the verified session (req.mcpSession.userId)
            const org = 'default-org';
            const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            // TODO: fetch instructions from cloud storage

            return {
                content: [
                    {
                        type: 'text' as const,
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
            // TODO: resolve org from the verified session (req.mcpSession.userId)
            const org = 'default-org';
            const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            // TODO: fetch code styles from cloud storage

            return {
                content: [
                    {
                        type: 'text' as const,
                        text: `Code styles for ${org}/${project}@${branch}`,
                    },
                ],
            };
        }
    );

    return server;
}

app.listen(PORT, () => {
    console.log(`CortexBridge listening on ${BASE_URL}`);
    console.log(`  Auth server: ${BASE_URL}/api/auth`);
    console.log(`  MCP endpoint: ${BASE_URL}/mcp`);
});
