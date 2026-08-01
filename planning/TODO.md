# TODO

## Foundation

- [ ] Better Auth OAuth 2.1 Provider (`@better-auth/oauth-provider`) — configured but unclear if deployed/working
- [ ] `.cortexconfig` specification and format

## Database

- [x] Neon Postgres backend (serverless/HTTP) via Drizzle ORM — configured
- [ ] Instructions schema v1 (schema defined but needs finalization)
- [ ] Schema migrations (create/apply migrations for organization, project, auth tables)
- [ ] Database seeding (populate initial data)
- [ ] Connection pooling setup (Neon serverless)
- [ ] Drizzle ORM queries for instructions CRUD

## MCP

- [ ] Server endpoints (HTTP + stdio entry points exist but return placeholders)
- [ ] OAuth 2.1 middleware integration (exists but not fully wired to fetch instructions)
- [ ] Resolve org from verified session (currently hardcoded to `'default-org'`)
- [ ] Fetch actual instructions from cloud storage (currently returns placeholder text)

## App

- [ ] Dashboard/project list page
- [ ] Create new project
- [ ] Edit project instructions
- [ ] Manage project metadata (name, description, stack)
- [ ] Conflict resolution UI for simultaneous writes

## Next Phase — Reach

- [ ] Team inheritance: org-level → repo-level → branch-level instructions
  - Define inheritance schema
  - Implement merge logic (how instructions compose across levels)
  - UI for managing team-level instructions
  - MCP server: resolve full inheritance chain on agent connect

## Potential Follow-up

- [ ] Audit logging (who changed what, when)
- [ ] Instruction versioning / history
- [ ] Branch-specific instruction overrides
- [ ] Bulk project operations
- [ ] CLI for `.cortexconfig` management
- [ ] Validation rules for instruction schema
- [ ] Rate limiting for MCP requests
- [ ] Monitoring and alerting for sync failures
