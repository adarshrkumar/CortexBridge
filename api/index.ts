import { toNodeHandler } from 'better-auth/node';
import { createMcpAuthClient } from 'better-auth/plugins/mcp/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { z } from 'zod';
import { auth } from '../src/auth/index.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const BASE_URL = process.env.BETTER_AUTH_URL ?? `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Better Auth OAuth 2.1 authorization server — handles /authorize, /token,
// /userinfo, /jwks, and all other auth endpoints.
app.all('/api/auth/*splat', toNodeHandler(auth));

// OAuth 2.1 authorization server discovery required by the MCP spec.
// Proxied directly from Better Auth's built-in discovery endpoint.
app.get('/.well-known/oauth-authorization-server', async (_req, res: ExpressResponse) => {
    const response = await auth.handler(
        new Request(`${BASE_URL}/api/auth/.well-known/oauth-authorization-server`)
    );
    const body = await response.text();
    res
        .status(response.status)
        .set('Content-Type', response.headers.get('content-type') ?? 'application/json')
        .end(body);
});

// OAuth 2.1 protected resource metadata required by the MCP spec.
app.get('/.well-known/oauth-protected-resource', (_req, res: ExpressResponse) => {
    res.json({
        resource: BASE_URL,
        authorization_servers: [BASE_URL],
        scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
        bearer_methods_supported: ['header'],
    });
});

// MCP auth client — verifies bearer tokens issued by Better Auth.
const mcpAuth = createMcpAuthClient({ authURL: BASE_URL });

// MCP endpoint — protected by OAuth bearer token verification.
// Transport is stateless (sessionIdGenerator: undefined) for serverless compatibility.
async function handleMcp(req: ExpressRequest, res: ExpressResponse) {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
}

app.post('/mcp', mcpAuth.middleware(), handleMcp);
app.get('/mcp', mcpAuth.middleware(), handleMcp);

function createMcpServer(): McpServer {
    const server = new McpServer({ name: 'cortexbridge', version: '0.1.0' });

    server.registerTool(
        'get-instructions',
        {
            description: 'Fetch instructions for the current org, project, and branch',
            inputSchema: {
                project: z.string().describe('The project ID from .cortexconfig'),
                git: z.object({
                    branch: z.string().describe('git rev-parse --abbrev-ref HEAD'),
                    commit: z.string().describe('git rev-parse HEAD'),
                    remote: z.string().optional().describe('git remote get-url origin'),
                }).describe('Current git state'),
            },
        },
        async ({ project, git }) => {
            // TODO: resolve org from verified session; fetch from cloud storage
            const org = 'default-org';
            return {
                content: [{ type: 'text' as const, text: `Instructions for ${org}/${project}@${git.branch}` }],
            };
        }
    );

    server.registerTool(
        'get-code-styles',
        {
            description: 'Fetch code style rules for the current org, project, and branch',
            inputSchema: {
                project: z.string().describe('The project ID from .cortexconfig'),
                git: z.object({
                    branch: z.string().describe('git rev-parse --abbrev-ref HEAD'),
                    commit: z.string().describe('git rev-parse HEAD'),
                    remote: z.string().optional().describe('git remote get-url origin'),
                }).describe('Current git state'),
            },
        },
        async ({ project, git }) => {
            // TODO: resolve org from verified session; fetch from cloud storage
            const org = 'default-org';
            return {
                content: [{ type: 'text' as const, text: `Code styles for ${org}/${project}@${git.branch}` }],
            };
        }
    );

    return server;
}

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`CortexBridge listening on ${BASE_URL}`);
        console.log(`  Auth:  ${BASE_URL}/api/auth`);
        console.log(`  MCP:   ${BASE_URL}/mcp`);
    });
}

export default app;
