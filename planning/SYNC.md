# Sync Protocol

## Overview

On agent startup, the CortexBridge MCP server fetches the project instructions from the cloud and returns them as context. The only local artifact is `.cortexconfig` — a pointer to the project.

## Local Config File

```yaml
# .cortexconfig
project: acme-api
```

The only file to commit. No instructions, no settings — just the project ID.

## Flow

```text
Agent starts
    │
    ▼
MCP server connects
    │
    ├─ reads .cortexconfig for project
    ├─ authenticates via Better Auth (MCP auth flow)
    ├─ fetches instructions from cloud
    └─ returns instructions as context (equivalent to AGENTS.md)
```

## Configuration

Instructions and project settings are configured via the CortexBridge web UI. The MCP server only reads — it returns context to the agent, it does not write.

Other project configs (outside of instructions) are provided by separate MCP tools.

## Authentication

CortexBridge uses [Better Auth](https://better-auth.com/) with the [OAuth 2.1 Provider](https://www.better-auth.com/docs/plugins/oauth-provider) plugin (`@better-auth/oauth-provider`). Better Auth acts as the authorization server — it issues and verifies access tokens for MCP clients via the standard OAuth 2.1 authorization code flow with PKCE.

Authentication happens at MCP connection time — the agent discovers the authorization server via `/.well-known/oauth-authorization-server`, completes the OAuth flow, and presents a bearer token on subsequent requests. No tokens are stored in `.cortexconfig` or the repo.

The Better Auth instance is backed by **Neon Postgres** (serverless/HTTP) via **Drizzle ORM** (`@neondatabase/serverless` + `drizzle-orm`). The database connection is configured via `DATABASE_URL`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `BETTER_AUTH_SECRET` | Random secret used to sign sessions and tokens |
| `BETTER_AUTH_URL` | Public base URL of the server (e.g. `https://cortexbridge.io`) |
| `DATABASE_URL` | Neon Postgres connection string |
| `PORT` | HTTP server port (default: `3000`) |
