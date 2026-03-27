# Instructions Schema

The project instructions are stored exclusively in the CortexBridge cloud and edited via the web UI. They are returned to agents at startup by the MCP server — equivalent to a shared, always-synced `AGENTS.md`.

## Structure

```yaml
version: 1
project:
  name: string
  description: string
  stack: string[]

instructions: string    # Markdown — returned to all agents via MCP

sync:
  strategy: last-write-wins | manual
```

## Fields

### `version`

Schema version. Currently `1`. A version bump is required for any breaking change.

### `project`

Metadata about the project. Displayed in the web UI.

### `instructions`

Markdown returned to every agent that connects via MCP. Write it exactly as you would an `AGENTS.md` file — conventions, architecture notes, team standards.

### `sync.strategy`

Configured in the web UI. Controls how simultaneous writes are resolved.

- `last-write-wins` (default): the most recent write wins.
- `manual`: conflicts are surfaced in the UI and must be resolved explicitly.

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
