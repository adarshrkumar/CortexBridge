# Contributing

## Getting Started

1. Fork the repository and clone your fork.
2. Install dependencies (see `src/README.md` once implementation begins).
3. Run the test suite to confirm a clean baseline.

## What to Work On

Check [ROADMAP.md](ROADMAP.md) for planned features. Open issues are the best place to find scoped, contributor-friendly work.

## Guidelines

- **Spec changes first.** If your contribution changes the manifest schema or sync protocol, update `docs/` before touching implementation code.
- **One adapter per PR.** New platform adapters should be submitted separately so they can be reviewed and tested in isolation.
- **Fixture-driven tests.** Adapter tests must use manifest fixtures from `tests/fixtures/` rather than inline test data.
- **No adapter should require network access.** If your adapter needs to fetch something, that belongs in the sync layer.

## Commit Style

Use the conventional commits format:

```text
feat(adapter): add cursor adapter
fix(sync): handle empty manifest on first pull
docs(schema): document context-pack resolution order
```

## Opening a Pull Request

- Reference the issue your PR addresses.
- Include a note in `docs/` if the change is user-visible.
- If you're adding a new adapter, update the adapter table in [ARCHITECTURE.md](ARCHITECTURE.md).
