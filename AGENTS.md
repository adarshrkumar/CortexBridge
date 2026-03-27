# Agent Instructions — CortexBridge

This file provides context for AI coding agents working on the CortexBridge codebase itself.

## Project Purpose

CortexBridge is a cloud-synced project manifest delivered via an MCP server. Its job is to give coding agents consistent, authoritative context regardless of which agent, IDE, or model is being used. The manifest lives in the cloud; the only local file is `.cortexconfig`, a small config pointer.

## Repository Layout

```text
docs/                # Specification and reference documentation
src/                 # Implementation source (MCP server, sync engine, adapters)
tests/               # Test suite
.cortexconfig        # Config pointer — CortexBridge uses itself
AGENTS.md            # This file
ARCHITECTURE.md      # System design
CONTRIBUTING.md      # Contribution guide
ROADMAP.md           # Planned work
```

## Conventions

- All specification documents live in `docs/` as Markdown.
- The cloud manifest schema is authoritative — adapters must conform to it, not the other way around.
- Adapter output formats are documented in `docs/adapters.md` and tested against fixture manifests.
- Breaking changes to the manifest schema require a version bump and a migration note in `docs/manifest-schema.md`.

## Key Constraints

- The MCP server must be stateless between requests; all state lives in the cloud store.
- Adapters are pure transformations: resolved manifest in, agent-format string out. No network calls.
- No adapter should require network access; fetching is handled exclusively by the MCP server.
