# Architecture

## Overview

```text
┌──────────────────┐ 
│ Any Coding Agent │ 
└────────┬─────────┘ 
         │           context via MCP
┌────────▼─────────┐ 
│    MCP Server    │ CortexBridge — the bridge
└────────┬─────────┘ 
         │           fetches on startup
┌────────▼─────────┐ 
│      Cloud       │ project instructions
└──────────────────┘ 
```

The only file that lives in your repo is `.cortexconfig` — a project ID pointer. The instructions live in the cloud, edited via the web UI, and are returned to the agent by the MCP server at startup.

Any agent that supports MCP gets the same instructions. No per-platform files, no per-platform configuration.

## Components

### Config File (`.cortexconfig`)

The only local artifact. Committed to the repo. Contains:

- `project` — identifies the project in the cloud

No instructions, no settings — just a pointer. Authentication is handled by Better Auth via the MCP auth flow.

### Project Instructions

Live exclusively in the CortexBridge cloud. Edited via the web UI. Returned to agents as context — equivalent to a shared, always-synced `AGENTS.md`.

### MCP Server

On agent startup it:

1. Reads `.cortexconfig` to get `project`
2. Authenticates via Better Auth using the MCP auth flow
3. Fetches the instructions from the cloud
4. Returns them as context — equivalent to an `AGENTS.md` file

Other project configs are provided by separate MCP tools; CortexBridge is focused solely on delivering the instructions.
