# Contributing

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies (see `src/README.md` once implementation begins).
3. Run the test suite to confirm a clean baseline.

## What to Work On

Check [ROADMAP.md](ROADMAP.md) for planned features. Open issues are the best place to find scoped, contributor-friendly work.

## Guidelines

- **Spec changes first.** If your contribution changes the instructions schema or sync protocol, update `docs/` before touching implementation code.
- **The MCP server is read-only.** It fetches and returns instructions — no writes, no side effects.

## Commit Style

Use the conventional commits format:

```text
feat(mcp): return instructions on connect
fix(auth): handle expired Better Auth session
docs(schema): clarify instructions field structure
```

## Opening a Pull Request

- Reference the issue your PR addresses.
- Include a note in `docs/` if the change is user-visible.
