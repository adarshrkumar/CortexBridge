import { createMcpAuthClient } from 'better-auth/plugins/mcp/client';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import config from '../../config.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const domain = new URL(config.url).hostname;
const MCP_URL = `https://${config.subdomains.mcp}.${domain}`;
const AUTH_URL = `https://${config.subdomains.auth}.${domain}`;

const app = express();
app.use(express.json());
app.use(express.static(join(fileURLToPath(new URL('.', import.meta.url)), '../public')));

// OAuth 2.1 authorization server discovery required by the MCP spec.
// Proxied from the auth service.
async function proxyWellKnown(_req: ExpressRequest, res: ExpressResponse) {
    const response = await fetch(`${AUTH_URL}/api/auth/.well-known/oauth-authorization-server`);
    const body = await response.text();
    res
        .status(response.status)
        .set('Content-Type', response.headers.get('content-type') ?? 'application/json')
        .end(body);
}

app.get('/.well-known/oauth-authorization-server', proxyWellKnown);
app.get('/.well-known/oauth-authorization-server/api/auth', proxyWellKnown);

// OAuth 2.1 protected resource metadata required by the MCP spec.
app.get('/.well-known/oauth-protected-resource', (_req, res) => {
    res.json({
        resource: MCP_URL,
        authorization_servers: [AUTH_URL],
        scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
        bearer_methods_supported: ['header'],
    });
});

// MCP auth client — verifies bearer tokens issued by the auth service.
const mcpAuth = createMcpAuthClient({ authURL: AUTH_URL });

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
        console.log(`CortexBridge MCP listening on http://localhost:${PORT}`);
        console.log(`  Auth: ${AUTH_URL}`);
        console.log(`  MCP:  http://localhost:${PORT}/mcp`);
    });
}

export default app;
