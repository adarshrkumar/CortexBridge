# CortexBridge

> A cloud-synced AGENTS.md that provides consistent instructions and project context for coding agents across all products, platforms, and models.

CortexBridge solves agent context drift — when the same project is worked on by different AI coding agents and each operates without shared standards, architecture decisions, or team conventions.

Your project instructions live in the cloud. A small config file in your repo tells CortexBridge which project to load. An MCP server returns the instructions to whichever agent is running — the same content that would otherwise live in a static `AGENTS.md` file, but centrally managed and always in sync.

## How It Works

1. A **config file** (`.cortexconfig`) lives in your repo — just a project ID.
2. The **project instructions** live exclusively in the cloud, edited via the web UI.
3. The **MCP server** connects on agent startup and returns the instructions as context.
4. Every coding agent — regardless of product or model — gets the same authoritative instructions.

## Key Concepts

| Concept | Description |
| --- | --- |
| **Project instructions** | Agent context stored in the cloud — the equivalent of a shared `AGENTS.md` |
| **Config file** | `.cortexconfig` — the only file committed to your repo; contains the project ID |
| **MCP server** | Fetches and returns the instructions to the agent at startup |

## Documentation

- [Architecture](ARCHITECTURE.md) — System design and component overview
- [Sync Protocol](SYNC.md) — How the MCP server fetches and returns context
- [Features](FEATURES.md) — Full feature list
- [Roadmap](ROADMAP.md) — Planned features and milestones
- [Contributing](CONTRIBUTING.md) — How to contribute

## Project Files

- [DESCRIPTION.md](DESCRIPTION.md) — One-line project description
- [AGENTS.md](AGENTS.md) — Agent instructions for working on CortexBridge itself
