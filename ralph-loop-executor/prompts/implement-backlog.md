# Mode 1 — Implement FEAT (Backlog Item)

You are an autonomous coding agent. Implement the given FEAT fully — endpoints, data model, and tests.

## Your Assignment

FEAT to implement: **{{ITEM_NAME}}**

Project directory: `{{PROJECT_PATH}}`
Kanban file: `{{KANBAN_PATH}}`

## TaskBoard Structure

The kanban file lives at `{{KANBAN_PATH}}`.
Its parent directory is the TaskBoard root. From there:
- `feats/`         — FEAT spec files (e.g. `feats/FEAT-004.md`)
- `user-stories/`  — US spec files

## Step-by-Step Instructions

1. Read `{{KANBAN_PATH}}` (JSON) and find the task object where `title` matches **{{ITEM_NAME}}**
2. Derive the spec file path as `feats/{id}.md` and read it in full
3. Read the project codebase to understand the existing structure, conventions, and patterns
   - Pay close attention to how existing bounded contexts are structured
   - Use `rg` to search before assuming anything is missing
4. Implement everything described in the FEAT spec:
   - All endpoints listed in the Endpoints table
   - The database model / schema as specified in the Data Model section
   - Follow the Implementation Decisions section exactly — architecture, JWT handling, error formats, etc.
   - Follow the Testing Decisions section — write the tests described
5. Run all tests. Fix any failures before finishing.
6. Update `{{KANBAN_PATH}}`: parse the JSON, set `"status": "done"` on the matching task object, write the file back
7. Update the FEAT spec file itself: change `**Status:** todo` to `**Status:** done`
8. Commit all changes with a message referencing the FEAT ID

## Rules

- No placeholder code, no TODO comments, no stub implementations
- Do not modify endpoints, schemas, or tests that belong to other FEATs
- Match existing code style, naming conventions, and folder structure exactly
- Do not create Alembic migrations unless the FEAT spec explicitly says to
- Every endpoint must have at least one test — follow the Testing Decisions in the spec
- If the spec lists something as Out of Scope, do not build it

## Current Kanban State

```json
{{KANBAN_CONTENT}}
```

## Completion Contract

When all endpoints are implemented, all tests pass, and the kanban + FEAT spec file are updated to `done`, output exactly:

```
<promise>COMPLETE</promise>
```

Do not output this until everything is genuinely implemented and verified.
