# Context Packs

Context packs are reusable, shareable bundles of agent instructions for common stacks, frameworks, or team conventions. They are stored in the CortexBridge cloud registry and referenced from a manifest by name.

## Why Context Packs

Instead of every team writing their own TypeScript or Django conventions from scratch, packs let you pull in a well-maintained baseline and layer your project-specific additions on top.

## Using a Pack

Reference packs in your manifest by name:

```yaml
context_packs:
  - name: typescript-strict
  - name: postgres-conventions
    version: "2.1"
```

Packs are resolved at sync time and merged into `instructions.shared` before adapters run. Project-level `instructions.shared` always takes precedence over pack content.

## Pack Resolution Order

```
context_packs[0] content
    + context_packs[1] content
    + ...
    + instructions.shared (project overrides)
    + instructions.overrides.<platform>
    ─────────────────────────────────────────
    → adapter output
```

## Creating a Pack

Packs are Markdown documents with an optional YAML front matter header:

```markdown
---
name: typescript-strict
description: Strict TypeScript conventions for monorepos
stack: [typescript]
version: "1.0"
---

## TypeScript Conventions

- Enable `strict: true` in all tsconfig files.
- Prefer `type` over `interface` for object shapes.
- Use `Result<T, E>` for error-prone operations — never throw across module boundaries.
```

## Publishing a Pack

Packs are published to the CortexBridge cloud registry via the CLI:

```bash
cortex pack publish ./my-pack.md
```

Published packs are versioned. A pack version is immutable once published.
