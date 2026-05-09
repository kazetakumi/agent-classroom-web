# PRD: Ralph Mode 1 — Full Kanban Orchestration

## Problem Statement

Ralph currently requires the user to manually specify a single backlog item or user story to work on via the `item` config field. Mode 1 implements one FEAT at a time, and there is no automated way to walk the entire kanban board and implement everything. Users must manually invoke Ralph repeatedly — once per FEAT, once per user story — which defeats the purpose of autonomous execution.

## Solution

Rework Mode 1 into a fully automated orchestration loop. Ralph reads the kanban JSON, finds all outstanding feats, and for each feat iterates through its user stories in a while loop until everything is done. Each user story is handed off to a fresh Claude Code instance. Ralph owns all status transitions and git commits. The user runs Ralph once and it drives the entire backlog to completion.

## User Stories

1. As a developer, I want Ralph Mode 1 to automatically discover all feats in the kanban, so that I don't have to manually specify each one.
2. As a developer, I want Ralph to process one feat fully before moving to the next, so that git history stays grouped by feat and changes don't interleave.
3. As a developer, I want Ralph to use a while loop for user stories within a feat, so that it keeps retrying until all stories reach `done` status.
4. As a developer, I want Ralph to mark a user story as `inprogress` before spawning a Claude instance, so that the kanban reflects live execution state.
5. As a developer, I want Ralph to mark a user story as `done` and commit after a Claude instance succeeds, so that progress is persisted incrementally.
6. As a developer, I want Ralph to reset a user story back to `todo` when Claude fails, so that the while loop self-heals and retries on the next pass.
7. As a developer, I want Ralph to skip user stories that have unresolved blocked dependencies, so that implementation order is respected.
8. As a developer, I want Ralph to mark a feat as `done` once all its user stories are done, so that the kanban accurately reflects feat-level completion.
9. As a developer, I want each spawned Claude instance to follow TDD, so that implementations are test-driven from the start.
10. As a developer, I want Ralph (not Claude) to own all kanban status writes, so that the orchestrator is the single source of truth for task state.
11. As a developer, I want git commits made after each user story with a conventional commit message referencing the US ID, so that history is traceable.
12. As a developer, I want the `item` config field to be ignored for Mode 1, so that I don't need to change my config when running a full board sweep.
13. As a developer, I want Modes 2 and 3 to continue requiring the `item` field, so that targeted single-item runs still work as before.
14. As a developer, I want Ralph to re-read the kanban from disk on every iteration, so that status changes written by Ralph are reflected in loop logic.

## Implementation Decisions

### Kanban I/O
- Ralph parses the kanban JSON into a Python dict at startup and re-reads it from disk before each iteration of the while loop to reflect latest state.
- Ralph writes status changes directly to the kanban JSON file after each Claude run.
- Functions: `load_kanban(path) -> dict`, `save_kanban(path, data)`, `set_status(data, task_id, status) -> dict`.

### Task Querying
- `get_feats(kanban) -> list[dict]` — returns all top-level tasks where `type == "feat"` and `status != "done"`, in order.
- `get_open_stories(feat) -> list[dict]` — returns children of a feat where `status != "done"`.
- `get_unblocked_todos(stories, kanban) -> list[dict]` — from the open stories, returns those with `status == "todo"` where every ID in the `blocked` array has `status == "done"` in the kanban.

### Mode 1 Loop Structure
- Outer loop: iterate feats in kanban order, process one fully before moving to the next.
- Inner while loop: runs until `get_unblocked_todos` returns an empty list and no story has `status == "inprogress"`. Exits when all stories are `done` or the only remaining stories are blocked (deadlock guard).
- On each inner iteration: pick the first unblocked `todo` story, set it to `inprogress`, spawn Claude with the mode 3 prompt, evaluate result.
- On success: set story to `done`, run git commit.
- On failure: set story back to `todo`.
- After inner while loop exits: set feat status to `done`.

### Git Commits
- `git_commit(project_path, message) -> bool` runs after each successful user story.
- Commit message format: `feat(US-XXX): implement <user story title>`.

### Config Changes
- `item` field validation is skipped when `mode == "1"`.
- No schema changes to `ralph.toml`.

### Prompt Changes
- `implement-userstory.md`: prepend `Use the /tdd skill for this implementation.` as the first line.
- `implement-userstory.md`: remove the step that instructs Claude to update the kanban JSON status — Ralph owns this.

### Claude Runner
- No changes to `run_claude()`. It continues to spawn a Claude instance, stream output, and return `(clean_exit, complete)`.

## Testing Decisions

No automated tests required for this feature.

## Out of Scope

- Parallel execution of user stories or feats.
- Mode 2 and Mode 3 behavioral changes (beyond the prompt edit to `implement-userstory.md`).
- Deadlock resolution when all remaining stories are blocked by each other — Ralph will log and exit gracefully.
- Changes to the kanban JSON schema.
- Any UI or dashboard for monitoring execution state.

## Further Notes

- The `inprogress` status acts as a crash marker. If Ralph is interrupted mid-run, any story left as `inprogress` will not be picked up on restart (since the while loop only picks `todo`). A future improvement could reset stale `inprogress` stories on startup.
- Blocked story resolution is purely status-based: Ralph checks `status == "done"` on blocking IDs. It does not re-order stories or resolve circular dependencies.
- The `/tdd` skill directive in the prompt relies on the spawned Claude instance having the skill available in its environment.
