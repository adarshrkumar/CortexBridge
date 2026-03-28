# Agent Instructions — CortexBridge MCP

This file provides context for AI coding agents working on the `mcp` workspace.

## What This Package Does

The MCP server exposes two tools — `get-instructions` and `get-code-styles` — over OAuth 2.1-protected HTTP (`api/index.ts`) and stdio (`src/server/index.ts`). It fetches per-org/project/branch instructions from cloud storage and returns them to the calling agent.

## Package Layout

```text
api/index.ts         # HTTP server — Express + Better Auth + StreamableHTTP transport
src/server/index.ts  # Stdio server — for local/CLI use
tests/index.ts       # Integration tests
public/              # Static assets served at root (colors.css, style.css, index.html)
tsconfig.json        # TypeScript config
vercel.json          # Vercel deployment config
```

## Architecture

- **Two entry points**: `api/index.ts` (HTTP/Vercel) and `src/server/index.ts` (stdio). Tool logic is currently duplicated between them — keep them in sync until a shared `src/tools/` layer is extracted.
- **Stateless by design**: `sessionIdGenerator: undefined` on the transport — no in-memory session state. Every request is independent.
- **Auth**: Better Auth handles OAuth 2.1 (authorization server + token verification). The MCP endpoint at `/mcp` is protected by `mcpAuth.middleware()`. Org identity is resolved from the verified session — never trust client-supplied org values.
- **Tools**: Each tool receives `project` (from `.cortexconfig`) and `git` state. The org is resolved server-side from the session.

## Current TODOs

- Resolve org from the verified Better Auth session (currently hardcoded to `'default-org'`)
- Fetch instructions and code styles from cloud storage (currently returns placeholder text)
- Extract shared tool definitions out of both entry points into `src/tools/`

## Code Style

- Single quotes for all strings
- 4-space indentation
- No `any` types
- No unused variables (prefix with `_` to ignore)
- Never create a function just to wrap a single line of code
- Never assign a simple condition to an intermediate boolean variable — use the condition inline (e.g. `mode === 'login'`, not `const isLogin = mode === 'login'`)
- No re-export stubs — move the actual content, never create a file that only re-exports another

## Verification

- Always run `npm run lint` or `npm run check` — never run `tsc`, `eslint`, or `stylelint` directly.

## Key Constraints

- The MCP server must be stateless between requests; all state lives in the cloud.
- Authentication is handled exclusively by Better Auth via the MCP auth flow.
- Never expose org/project data without a verified session.
