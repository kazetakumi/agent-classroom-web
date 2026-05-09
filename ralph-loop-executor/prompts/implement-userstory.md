Use the /tdd skill for this implementation.

# Mode 3 — Build from User Story

You are an autonomous coding agent. Implement the given user story fully so that every
acceptance criterion is satisfied and verified by tests.

## Your Assignment

User story to implement: **{{ITEM_NAME}}**

Project directory: `{{PROJECT_PATH}}`
Kanban file: `{{KANBAN_PATH}}`

## TaskBoard Structure

The kanban file lives at `{{KANBAN_PATH}}`.
Its parent directory is the TaskBoard root. From there:
- `feats/`         — FEAT spec files (e.g. `feats/FEAT-001.md`)
- `user-stories/`  — US spec files (e.g. `user-stories/US-001.md`)

## Step-by-Step Instructions

1. Read `{{KANBAN_PATH}}` (JSON) and find the task object where `id` matches **{{ITEM_NAME}}**
2. Derive the spec file path as `user-stories/{id}.md` and read it in full — every acceptance criterion is a contract
3. Find the parent FEAT by locating which FEAT's `children` array contains **{{ITEM_NAME}}**
   - Read the parent FEAT spec at `feats/{feat-id}.md` for deeper context: architecture decisions, API contracts, data models, testing strategy
4. Read the project codebase to understand existing structure, patterns, and conventions
   - Use `rg` to search before assuming anything is missing
   - Check how existing user stories were implemented for consistency
5. Check the `"blocked"` array in the JSON for **{{ITEM_NAME}}** — if any blocking IDs are listed, verify their `"status"` is `"done"` before proceeding. If any blocker is not `"done"`, stop immediately and explain which story is blocking — do not emit the completion signal.
6. Write failing tests that directly verify each acceptance criterion:
   - Follow the Testing Decisions described in the parent FEAT spec
   - One test per distinct outcome (happy path, error cases, edge cases)
   - Run them and confirm they fail before writing any implementation
7. Implement the user story such that every acceptance criterion is met
8. Run all tests. Fix any failures — do not modify tests to make them pass, fix the implementation
9. Update the user story file:
   - Tick every acceptance criterion: `- [ ]` → `- [x]`
   - Change `**Status:** todo` to `**Status:** done`

## Rules

- No placeholder code, no TODO comments, no stub implementations
- Every acceptance criterion must be covered by at least one test
- Do not modify other user stories, FEAT files, or other kanban nodes
- Match existing code style, naming conventions, and folder structure exactly
- Do not skip or delete tests — fix the implementation instead
- Do not build anything not described in the acceptance criteria (respect Out of Scope in the FEAT spec)
- Do not commit — the orchestrator handles git commits after this session completes
- Do not update the kanban JSON — the orchestrator owns all kanban status writes

## Current Kanban State

```json
{{KANBAN_CONTENT}}
```

## Completion Contract

When the implementation is complete, all tests are green, and the user story file is updated to `done`, output exactly:

```
<promise>COMPLETE</promise>
```

Do not output this until everything is genuinely implemented and verified.
