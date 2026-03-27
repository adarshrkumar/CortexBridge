# CortexBridge

> A cloud-synced project manifest that provides consistent AGENTS.md instructions and project context for coding agents across all products, platforms, and models.

CortexBridge solves agent context drift — when the same project is worked on by different AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.) and each operates without shared standards, architecture decisions, or team conventions.

The manifest lives entirely in the cloud. A small config file in your repo tells CortexBridge which project to load. An MCP server handles fetching the manifest and injecting context into whichever agent is running.

## How It Works

1. A **config file** (`.cortexconfig`) lives in your repo — just a project ID and token pointer.
2. The **manifest** (instructions, context, overrides) lives exclusively in the cloud.
3. The **MCP server** connects to the cloud on agent startup, fetches the manifest, and serves it as context to the agent.
4. Every coding agent — regardless of product or model — gets the same authoritative context.

## Key Concepts

| Concept | Description |
| --- | --- |
| **Manifest** | Cloud-hosted instructions, conventions, and context for a project |
| **Config file** | `.cortexconfig` — the only file committed to your repo; points to the cloud manifest |
| **MCP server** | The bridge between agents and the cloud manifest |
| **Adapters** | Per-platform translators that render manifest content in agent-native formats |
| **Context Packs** | Reusable, shareable instruction bundles from the cloud registry |

## Documentation

- [Architecture](ARCHITECTURE.md) — System design and component overview
- [Manifest Schema](docs/manifest-schema.md) — Full reference for the cloud manifest
- [Sync Protocol](docs/sync-protocol.md) — How the MCP server fetches and serves context
- [Context Packs](docs/context-packs.md) — Creating and sharing reusable instruction bundles
- [Roadmap](ROADMAP.md) — Planned features and milestones
- [Contributing](CONTRIBUTING.md) — How to contribute

## Project Files

- [DESCRIPTION.md](DESCRIPTION.md) — One-line project description
- [AGENTS.md](AGENTS.md) — Agent instructions for working on CortexBridge itself
