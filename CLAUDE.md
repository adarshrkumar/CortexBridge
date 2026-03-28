# Agent Instructions — CortexBridge

This file provides context for AI coding agents working on the CortexBridge codebase itself.

## Project Purpose

CortexBridge is a cloud-synced `AGENTS.md` delivered via an MCP server. It gives coding agents consistent, authoritative instructions regardless of which agent, harness, or model is being used. The instructions live in the cloud; the only local file is `.cortexconfig`, a project ID pointer.

## Repository Layout

```text
mcp/                 # MCP server — Express API, auth, tool handlers
app/                 # Astro web app — org/project/branch configuration UI
docs/                # Astro docs site — specification and reference
styles/              # Shared design tokens, colors, mixins (JSON source + generate scripts)
  scripts/           # generate-colors.mjs, generate-tokens.mjs, generate-mixins.mjs
  colors.json        # Color palette source
  tokens.json        # Design token source
  mixins.json        # Mixin source (breakpoints etc.)
  property-order.json  # CSS property order by section
.cortexconfig        # Project ID pointer — CortexBridge uses itself
stylelint.config.mjs # Root stylelint config (covers all workspaces)
eslint.config.js     # Root ESLint config (covers mcp workspace)
```

## Workspaces

This is an npm workspaces monorepo. Each workspace has its own `package.json`:

- `mcp` — MCP server, run `npm run check` to lint + test
- `app` — Astro app, run `npm run check` to lint
- `docs` — Astro docs site

Run `npm run check` from the **root** to check all workspaces at once.

## Styles

Shared styles are generated from JSON source files in `styles/`. Never edit generated output files directly — edit the JSON source and re-run the generator scripts, or run `npm run styles` in the relevant workspace.

Generated outputs:

- `mcp/public/colors.css` — CSS custom properties
- `app/src/styles/variables/colors.scss` — SCSS color variables
- `app/src/styles/variables/tokens.scss` — SCSS design token variables
- `app/src/styles/mixins.scss` — SCSS mixins (when breakpoints are defined)

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
- CSS class names use `block__element` format — never add modifier classes; add an additional class if needed
- For state-based styling, use data attributes or ARIA attributes (e.g. `[aria-disabled]`, `[data-state="open"]`) — never BEM modifier classes
- CSS selectors must always be expanded — one property per line, never condensed on a single line
- CSS properties must follow the order defined in `styles/property-order.json`
- JSON must never combine multiple properties on one line — one property per line always
- Function call arguments must always be expanded — one argument per line when wrapped, never condensed on a single line

## Verification

- Always run `npm run lint` or `npm run check` from the repo root or the relevant workspace — never run `tsc`, `eslint`, or `stylelint` directly.

## Key Constraints

- The MCP server must be stateless between requests; all state lives in the cloud.
- Authentication is handled exclusively by Better Auth via the MCP auth flow.
- The app is a fluid layout — no breakpoints, no fixed widths beyond max-width constraints.
