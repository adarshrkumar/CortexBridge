# Features

## Core

- Cloud-hosted project instructions (equivalent to a shared `AGENTS.md`)
- MCP server that returns instructions to any connected agent on startup
- `.cortexconfig` — a single committed file containing only the project ID
- Better Auth via MCP auth flow — no tokens stored in the repo

## Web UI

- Create and edit project instructions
- Project metadata management (name, description, stack)
- Conflict resolution when simultaneous writes occur

## Planned

- CI integration: warn when instructions are out of sync
- Team inheritance: org-level → repo-level → branch-level instructions
