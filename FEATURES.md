# Features

## Core

- Project instructions stored in the cloud (equivalent to a shared `AGENTS.md`)
- MCP server that returns instructions to any connected agent on startup
- `.cortexconfig` — a single committed file containing only the project ID
- Better Auth OAuth 2.1 Provider (`@better-auth/oauth-provider`) — no tokens stored in the repo
- Neon Postgres (serverless/HTTP) via Drizzle ORM for all persistent state

## Web UI

- Create and edit project instructions
- Project metadata management (name, description, stack)
- Conflict resolution when simultaneous writes occur

## Planned

- Team inheritance: org-level → repo-level → branch-level instructions
