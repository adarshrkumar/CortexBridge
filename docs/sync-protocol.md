# Sync Protocol

## Overview

CortexBridge uses a pull-on-startup model. The manifest lives in the cloud; agents fetch it fresh each time they start. The only local artifact is a lightweight config file that tells the bridge where to find the manifest.

## Local Config File

A small config file (`.cortexconfig`) lives in the project root or home directory. It contains only the pointer to the cloud manifest — no instructions, no context.

```yaml
# .cortexconfig
project_id: acme-api
```

Everything else — instructions, context packs, auth — lives outside the repo. Authentication is handled by Better Auth via the MCP auth flow at runtime.

## Pull Flow

```text
Agent starts
    │
    ▼
MCP server connects
    │
    ├─ reads .cortexconfig for project_id
    ├─ authenticates via Better Auth (MCP auth flow)
    ├─ fetches manifest from cloud store
    ├─ resolves context pack references
    └─ serves context to agent via MCP tools/resources
```

The only file to commit is `.cortexconfig`.

## Update Flow

Manifest updates happen via the CortexBridge web UI or API — not by editing local files. All writes are authenticated via Better Auth before being accepted by the cloud store.

## Conflict Resolution

| Strategy | Behavior |
| --- | --- |
| `last-write-wins` | Most recent push is accepted without review |
| `manual` | Conflict is stored; next puller must resolve before pull succeeds |

## Authentication

CortexBridge uses [Better Auth](https://www.better-auth.com/) with its MCP auth plugin. Authentication happens at MCP connection time — the agent is prompted to log in via the Better Auth flow if no valid session exists. No tokens are stored in `.cortexconfig` or the repo.
