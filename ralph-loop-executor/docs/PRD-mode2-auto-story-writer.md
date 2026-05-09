# PRD: Ralph Mode 2 — Auto User Story Writer

## Problem Statement

Ralph Mode 2 currently requires the user to manually specify a single FEAT via the `item` config field and run Ralph once per FEAT to generate user stories. When a kanban board contains multiple FEATs with no user stories yet, the user must invoke Ralph repeatedly — once per FEAT — to populate the board before Mode 1 can begin implementation. This manual, repetitive invocation defeats the goal of autonomous execution.

## Solution

Rework Mode 2 into a fully automated story-writing loop. Ralph reads the kanban JSON, discovers all FEATs that have no children (no user stories written yet), and for each one spawns a fresh Claude Code instance to break the FEAT down into well-formed user story files and register them in the kanban JSON. Ralph retries each FEAT until Claude signals completion or the iteration limit is hit. The user runs Ralph once and all eligible FEATs are populated with user stories.

## User Stories

1. As a developer, I want Ralph Mode 2 to automatically discover all FEATs that have no user stories, so that I don't have to manually specify each one.
2. As a developer, I want Mode 2 to skip FEATs that already have children in the kanban, so that existing user stories are never duplicated or overwritten.
3. As a developer, I want Mode 2 to skip FEATs whose status is `done`, so that completed work is never re-processed.
4. As a developer, I want Mode 2 to process one FEAT fully before moving to the next, so that kanban JSON writes from concurrent Claude instances never conflict.
5. As a developer, I want Mode 2 to retry Claude on a FEAT until it outputs the completion signal, so that transient failures are automatically recovered.
6. As a developer, I want Mode 2 to stop retrying a FEAT after `max_iterations` attempts, so that infinite loops are impossible.
7. As a developer, I want Mode 2 to log each attempt and its outcome, so that I can diagnose failures from the log file.
8. As a developer, I want Mode 2 to commit to git after each FEAT's user stories are successfully written, so that progress is persisted incrementally and safe from crashes.
9. As a developer, I want the `item` config field to be ignored when `mode == "2"`, so that I don't need to change my config when running a full board sweep.
10. As a developer, I want the FEAT's kanban status to remain `todo` throughout Mode 2, so that Mode 1's `get_feats()` query continues to treat it as pending implementation.
11. As a developer, I want Ralph (not Claude) to own git commits, so that the orchestrator is the single source of truth for version control.
12. As a developer, I want Mode 2 to print a clear banner at startup showing the project path, kanban path, and log file, so that I can confirm it is targeting the right board.
13. As a developer, I want Mode 2 to print a section header for each FEAT it processes, so that I can follow progress in the terminal.
14. As a developer, I want Mode 2 to print a warning when no eligible FEATs are found, so that I understand immediately why nothing ran.
15. As a developer, I want Mode 2 to exit cleanly after all FEATs are processed, so that it can be scripted or chained with Mode 1.
16. As a developer, I want each Mode 2 run to write a full log to `logs/mode2_<timestamp>.log`, so that I have an audit trail of what Claude produced.

## Implementation Decisions

### New Query Function
- `get_feats_without_stories(kanban) -> list[dict]` — returns all top-level tasks where `type == "feat"`, `status != "done"`, and `children == []`. This is the sole filter for Mode 2 eligibility.

### Mode 2 Loop Structure
- Outer loop: iterate FEATs returned by `get_feats_without_stories` in kanban order.
- Inner retry loop: for each FEAT, re-read the kanban from disk, rebuild the prompt with fresh kanban content, spawn Claude, and check for the completion signal.
- On completion signal: call `git_commit` with message `feat(FEAT-XXX): write user stories for <title>`.
- On failure (no completion signal): log the outcome and retry on the next iteration.
- After `max_iterations` attempts without completion: log a warning and move to the next FEAT.

### No FEAT Status Transitions
- Mode 2 does not write any status changes to the kanban JSON. The FEAT stays `todo`. The presence of children in the kanban after Claude runs is the natural indicator that stories were written.

### Config Changes
- `item` field validation is skipped when `mode == "2"`, matching Mode 1's behavior.
- No schema changes to `ralph.toml`.

### Prompt Reuse
- Mode 2 continues to use `prompts/create-userstories.md` unchanged. The prompt already accepts `{{ITEM_NAME}}` as the FEAT title — `build_prompt` is called with `feat["title"]` as the item.

### Git Commits
- `git_commit(project_path, message)` is reused from Mode 1. Called once per successfully completed FEAT. Commit message: `feat(FEAT-XXX): write user stories for <title>`.

### Orchestrator Placement
- `run_mode2` is added immediately before `main()`, following the same layout as `run_mode1`.
- `main()` branches: `if mode == "2": run_mode2(...); return` before the `item = require(...)` call.

## Testing Decisions

No automated tests are required for this feature, consistent with Mode 1's testing decision. The implementation is a thin orchestration loop over existing, already-exercised helpers (`load_kanban`, `save_kanban`, `build_prompt`, `run_claude`, `git_commit`).

## Out of Scope

- Parallel execution of FEATs in Mode 2.
- Status transitions on the FEAT node during story writing.
- Modifying `prompts/create-userstories.md`.
- Processing FEATs that already have children (partial story sets are not topped up).
- Any UI or dashboard for monitoring execution state.
- Mode 1 and Mode 3 behavioral changes.

## Further Notes

- Mode 2 is designed to be run before Mode 1. The typical workflow is: run Mode 2 to populate all FEATs with user stories, then run Mode 1 to implement them.
- If a FEAT has stale `inprogress` children from a prior crashed Mode 1 run, Mode 2 will skip it (children != []). This is intentional — Mode 2 only handles the zero-children case.
- The retry loop re-reads the kanban from disk before each Claude invocation so that any children added by Claude in a prior partial run are reflected. However, since Mode 2 skips FEATs with any children, a partial Claude run that added some children would cause Mode 2 to skip that FEAT on the next outer-loop pass. Manual cleanup would be required in that edge case.
