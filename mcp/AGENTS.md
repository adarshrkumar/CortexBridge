# Agent Instructions — CortexBridge

This file provides context for AI coding agents working on the CortexBridge codebase itself.

## Project Purpose

CortexBridge is a cloud-synced `AGENTS.md` delivered via an MCP server. It gives coding agents consistent, authoritative instructions regardless of which agent, IDE, or model is being used. The instructions live in the cloud; the only local file is `.cortexconfig`, a project ID pointer.

## Repository Layout

```text
docs/                # Specification and reference documentation
src/                 # Implementation source (MCP server, cloud sync)
tests/               # Test suite
.cortexconfig        # Project ID pointer — CortexBridge uses itself
AGENTS.md            # This file
ARCHITECTURE.md      # System design
CONTRIBUTING.md      # Contribution guide
ROADMAP.md           # Planned work
```

## Conventions

- All specification documents live in `docs/` as Markdown.
- The instructions are the source of truth — see `SYNC.md` for how they are fetched and returned.
- The MCP server is read-only; it fetches and returns instructions, it does not write.

## Code Style

- Single quotes for all strings
- 4-space indentation
- No `any` types
- No unused variables (prefix with `_` to ignore)
- Never create a function just to wrap a single line of code
- Never assign a simple condition to an intermediate boolean variable — use the condition inline (e.g. `mode === 'login'`, not `const isLogin = mode === 'login'`)
- No re-export stubs — move the actual content, never create a file that only re-exports another
- Never use Tailwind CSS or any utility-first CSS framework — all styles must be written in SCSS
- Never use Tailwind-style naming conventions (e.g. `mt-4`, `text-sm`, `flex`) either
- For state-based styling, use data attributes or ARIA attributes (e.g. `[aria-disabled]`, `[data-state="open"]`) — never BEM modifier classes
- CSS selectors must always be expanded — one property per line, never condensed on a single line
- JSON must never combine multiple properties on one line — one property per line always
- Function call arguments must always be expanded — one argument per line when wrapped, never condensed on a single line

## Verification

- Always run `npm run lint` or `npm run check` — never run `tsc`, `eslint`, or `stylelint` directly.

## Key Constraints

- The MCP server must be stateless between requests; all state lives in the cloud.
- Authentication is handled exclusively by Better Auth via the MCP auth flow.
