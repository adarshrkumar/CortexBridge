# Architecture

## Overview

```text
┌─────────────────────────────────────────────┐
│                Coding Agents                │
│   (Claude Code, Copilot, Cursor, Gemini…)   │
└───────────────────┬─────────────────────────┘
                    │ context via MCP
         ┌──────────▼──────────┐
         │      MCP Server     │  CortexBridge — the bridge
         └──────────┬──────────┘
                    │ fetches on startup
         ┌──────────▼──────────┐
         │     Cloud Store     │  canonical manifest (instructions, context, packs)
         └─────────────────────┘
```

The only file that lives in your repo is `.cortexconfig` — a small config pointing to the cloud project. Everything else (instructions, conventions, context packs) lives in the cloud and is served to agents via the MCP server.

Any agent that supports MCP connects to CortexBridge and gets the same context. No per-platform files, no per-platform configuration.

## Components

### Config File (`.cortexconfig`)

The only local artifact. Committed to the repo. Contains:

- `project_id` — identifies the cloud manifest

No instructions, no context — just a pointer. Authentication is handled by Better Auth via the MCP auth flow; no token is stored in the config file.

### Cloud Manifest

Lives exclusively in the CortexBridge cloud. Contains:

- Project metadata (name, description, stack)
- Agent instructions shared across all agents
- Context pack references

See [docs/manifest-schema.md](docs/manifest-schema.md) for the full schema.

### MCP Server

The bridge between agents and the cloud. On agent startup it:

1. Reads `.cortexconfig` to get `project_id`
2. Authenticates via Better Auth using the MCP auth flow
3. Fetches the manifest from the cloud store
4. Resolves any referenced context packs
5. Exposes the resolved context to the agent via MCP tools/resources

Because CortexBridge is an MCP server, it works with any agent or IDE that supports MCP — no per-platform configuration required.

### Context Packs

Reusable instruction bundles stored in the CortexBridge cloud registry (e.g. "typescript-strict", "postgres-conventions"). Referenced from the manifest and resolved server-side before context is served to agents.
