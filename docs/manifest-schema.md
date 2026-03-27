# Manifest Schema

The manifest is a YAML file stored in the cloud (and optionally cached locally). It is the canonical source of truth for a project's agent context.

## File Location

The manifest lives exclusively in the CortexBridge cloud store. It is referenced by project ID and optionally by branch or environment. Agents retrieve it via `cortex pull` at startup.

## Top-Level Structure

```yaml
version: 1
project:
  name: string
  description: string
  stack: string[]

instructions:
  shared: string          # Markdown — sent to all agents
  overrides:              # Per-platform overrides (merged on top of shared)
    claude-code: string
    cursor: string
    copilot: string

context_packs:
  - name: string          # Registry pack name or local path
    version: string       # Optional; defaults to latest

sync:
  strategy: last-write-wins | manual   # Conflict resolution strategy
```

## Fields

### `version`

Schema version. Currently `1`. A version bump is required for any breaking change.

### `project`

Metadata about the project. Used by adapters to generate context-aware headers and by the registry to index context packs.

### `instructions.shared`

Markdown string injected into every adapter's output. This is where cross-agent conventions, architecture summaries, and team standards live.

### `instructions.overrides`

Per-platform Markdown that is appended after `shared` when generating output for that platform. Use overrides for platform-specific syntax (e.g. Claude Code slash commands, Cursor @ mentions).

### `context_packs`

List of reusable instruction bundles to merge into the manifest before adapter rendering. Packs are resolved from the CortexBridge cloud registry at sync time.

### `sync.strategy`

How conflicts are resolved when multiple writers push to the same manifest simultaneously.

- `last-write-wins` (default): the most recent push wins.
- `manual`: conflicts are surfaced and must be resolved explicitly.

## Example

```yaml
version: 1
project:
  name: acme-api
  description: REST API for the Acme platform
  stack: [typescript, node, postgres]

instructions:
  shared: |
    ## Conventions
    - Use `Result<T, E>` for error handling, never throw.
    - All database queries go through the repository layer.
    - Tests use Vitest; run `pnpm test` before committing.

  overrides:
    claude-code: |
      Use `/compact` when context gets large.

context_packs:
  - name: typescript-strict
  - name: postgres-conventions

sync:
  strategy: last-write-wins
```
