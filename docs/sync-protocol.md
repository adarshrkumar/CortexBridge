# Sync Protocol

## Overview

On agent startup, the CortexBridge MCP server fetches the project instructions from the cloud and returns them as context. The only local artifact is `.cortexconfig` — a pointer to the project.

## Local Config File

```yaml
# .cortexconfig
project_id: acme-api
```

The only file to commit. No instructions, no settings — just the project ID.

## Flow

```text
Agent starts
    │
    ▼
MCP server connects
    │
    ├─ reads .cortexconfig for project_id
    ├─ authenticates via Better Auth (MCP auth flow)
    ├─ fetches instructions from cloud
    └─ returns instructions as context (equivalent to AGENTS.md)
```

## Configuration

Instructions and project settings are configured via the CortexBridge web UI. The MCP server only reads — it returns context to the agent, it does not write.

Other project configs (outside of instructions) are provided by separate MCP tools.

## Conflict Resolution

Configured in the web UI per project.

| Strategy | Behavior |
| --- | --- |
| `last-write-wins` | Most recent write wins, no review required |
| `manual` | Conflicts are surfaced in the UI and must be resolved explicitly |

## Authentication

CortexBridge uses [Better Auth](https://www.better-auth.com/) with its MCP auth plugin. Authentication happens at MCP connection time — the agent is prompted to log in via the Better Auth flow if no valid session exists. No tokens are stored in `.cortexconfig` or the repo.
