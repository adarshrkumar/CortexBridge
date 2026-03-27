# Manifest Schema

The manifest is stored exclusively in the CortexBridge cloud. It is the canonical source of truth for a project's agent context, served to agents at runtime via the MCP server.

## Top-Level Structure

```yaml
version: 1
project:
  name: string
  description: string
  stack: string[]

instructions: string    # Markdown — served to all agents via MCP

sync:
  strategy: last-write-wins | manual
```

## Fields

### `version`

Schema version. Currently `1`. A version bump is required for any breaking change.

### `project`

Metadata about the project. Displayed in the web UI.

### `instructions`

Markdown served to every agent that connects via MCP. This is where cross-agent conventions, architecture summaries, and team standards live.

### `sync.strategy`

How conflicts are resolved when multiple writers update the manifest simultaneously. Configured via the web UI — not edited directly in the manifest.

- `last-write-wins` (default): the most recent write wins.
- `manual`: conflicts are surfaced in the web UI and must be resolved explicitly.

## Example

```yaml
version: 1
project:
  name: acme-api
  description: REST API for the Acme platform
  stack: [typescript, node, postgres]

instructions: |
  ## Conventions
  - Use `Result<T, E>` for error handling, never throw.
  - All database queries go through the repository layer.
  - Tests use Vitest; run `pnpm test` before committing.

sync:
  strategy: last-write-wins
```
