# Mode 1 Kanban Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Mode 1 to automatically walk all feats in the kanban, iterate their user stories in a while loop, spawn a fresh Claude instance per story, and manage all status transitions and git commits from the orchestrator.

**Architecture:** All kanban reads/writes are owned by Ralph (not by Claude). `ralph.py` gains four logical groups of new functions — kanban I/O, task querying, git, and the mode 1 orchestration loop — then `main()` is updated to branch into `run_mode1()` for mode 1 and skip the `item` config requirement in that path.

**Tech Stack:** Python 3.11+, `json` stdlib, `subprocess` (already used), `rich` (already used), `uv` script runner.

---

## File Map

| File | Change |
|------|--------|
| `prompts/implement-userstory.md` | Prepend TDD directive; remove kanban-update step and commit step; update completion contract |
| `ralph.py` | Add `import json`; add kanban I/O functions; add task query functions; add `git_commit`; add `run_mode1`; update `main()` |

---

### Task 1: Update `prompts/implement-userstory.md`

**Files:**
- Modify: `prompts/implement-userstory.md`

- [ ] **Step 1: Prepend TDD directive and remove kanban/commit steps**

Replace the entire file with:

```markdown
Use the /tdd skill for this implementation.

# Mode 3 — Implement from User Story

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
5. Check the `"blocked"` array in the JSON for **{{ITEM_NAME}}** — if any blocking IDs are listed, verify their `"status"` is `"done"` before proceeding
6. Implement the user story such that every acceptance criterion is met
7. Write tests that directly verify each acceptance criterion:
   - Follow the Testing Decisions described in the parent FEAT spec
   - One test per distinct outcome (happy path, error cases, edge cases)
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
```

- [ ] **Step 2: Commit**

```bash
git add prompts/implement-userstory.md
git commit -m "feat: add TDD directive and remove kanban/commit steps from mode 3 prompt"
```

---

### Task 2: Add `import json` and kanban I/O functions to `ralph.py`

**Files:**
- Modify: `ralph.py`

- [ ] **Step 1: Add `import json` after the existing `import subprocess` line**

The imports block currently starts at line 9. Add `import json` so it reads:

```python
import json
import subprocess
import sys
import tomllib
from datetime import datetime
from pathlib import Path
```

- [ ] **Step 2: Add kanban I/O functions after the `abort` helper (after line 67)**

Insert these three functions between `abort` and `build_prompt`:

```python
# ── Kanban I/O ─────────────────────────────────────────────────────────────────

def load_kanban(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

def save_kanban(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def set_status(data: dict, task_id: str, status: str) -> None:
    def walk(tasks: list) -> bool:
        for task in tasks:
            if task.get("id") == task_id:
                task["status"] = status
                return True
            if walk(task.get("children", [])):
                return True
        return False
    walk(data.get("tasks", []))
```

- [ ] **Step 3: Commit**

```bash
git add ralph.py
git commit -m "feat: add kanban I/O functions (load, save, set_status)"
```

---

### Task 3: Add task query functions to `ralph.py`

**Files:**
- Modify: `ralph.py`

- [ ] **Step 1: Add three query functions immediately after the kanban I/O block**

```python
# ── Task queries ───────────────────────────────────────────────────────────────

def get_feats(kanban: dict) -> list[dict]:
    return [
        t for t in kanban.get("tasks", [])
        if t.get("type") == "feat" and t.get("status") != "done"
    ]

def get_open_stories(feat: dict) -> list[dict]:
    return [c for c in feat.get("children", []) if c.get("status") != "done"]

def get_unblocked_todos(stories: list[dict], kanban: dict) -> list[dict]:
    status_map: dict[str, str] = {}

    def collect(tasks: list) -> None:
        for t in tasks:
            status_map[t["id"]] = t["status"]
            collect(t.get("children", []))

    collect(kanban.get("tasks", []))

    return [
        s for s in stories
        if s.get("status") == "todo"
        and all(status_map.get(b) == "done" for b in s.get("blocked", []))
    ]
```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: add task query functions (get_feats, get_open_stories, get_unblocked_todos)"
```

---

### Task 4: Add `git_commit` function to `ralph.py`

**Files:**
- Modify: `ralph.py`

- [ ] **Step 1: Add `git_commit` after the task query block**

```python
# ── Git ────────────────────────────────────────────────────────────────────────

def git_commit(project_path: Path, message: str) -> bool:
    stage = subprocess.run(["git", "add", "-A"], cwd=project_path)
    if stage.returncode != 0:
        return False
    commit = subprocess.run(["git", "commit", "-m", message], cwd=project_path)
    return commit.returncode == 0
```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: add git_commit helper"
```

---

### Task 5: Add `run_mode1` orchestration function to `ralph.py`

**Files:**
- Modify: `ralph.py`

- [ ] **Step 1: Add `run_mode1` immediately before the `main` function**

```python
# ── Mode 1 orchestrator ────────────────────────────────────────────────────────

def run_mode1(project_path: Path, kanban_path: Path, max_iter: int) -> None:
    template_path = PROMPTS_DIR / "implement-userstory.md"
    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode1_{timestamp}.log"

    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    "[bold]1[/bold] — Implement Backlog Item")
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    kanban = load_kanban(kanban_path)
    feats  = get_feats(kanban)

    if not feats:
        console.print(Panel("[yellow]No open feats found in kanban.[/yellow]", border_style="yellow"))
        return

    for feat in feats:
        feat_id    = feat["id"]
        feat_title = feat["title"]
        console.print(Rule(f"[cyan]FEAT {feat_id}: {feat_title}[/cyan]"))
        console.print()

        while True:
            kanban     = load_kanban(kanban_path)
            feat_fresh = next((t for t in kanban.get("tasks", []) if t["id"] == feat_id), None)
            if feat_fresh is None:
                break

            open_stories = get_open_stories(feat_fresh)
            if not open_stories:
                set_status(kanban, feat_id, "done")
                save_kanban(kanban_path, kanban)
                console.print(f"  [green]FEAT {feat_id} complete.[/green]\n")
                break

            unblocked = get_unblocked_todos(open_stories, kanban)
            if not unblocked:
                console.print(Panel(
                    f"[yellow]All remaining stories for {feat_id} are blocked — skipping.[/yellow]",
                    border_style="yellow",
                ))
                break

            story       = unblocked[0]
            story_id    = story["id"]
            story_title = story["title"]

            console.print(Rule(f"[yellow]Story {story_id}: {story_title}[/yellow]"))

            set_status(kanban, story_id, "inprogress")
            save_kanban(kanban_path, kanban)

            prompt = build_prompt(template_path, story_id, project_path, kanban_path)
            clean_exit, complete = run_claude(prompt, project_path, log_path)
            console.print()

            kanban = load_kanban(kanban_path)

            if complete:
                set_status(kanban, story_id, "done")
                save_kanban(kanban_path, kanban)
                git_commit(project_path, f"feat({story_id}): implement {story_title}")
                console.print(f"  [green]{story_id} done.[/green]\n")
            else:
                set_status(kanban, story_id, "todo")
                save_kanban(kanban_path, kanban)
                result_str = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
                console.print(f"  {result_str} — no completion signal. Resetting {story_id} to todo.\n")
```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: add run_mode1 orchestration loop"
```

---

### Task 6: Update `main()` to branch on mode 1 and skip `item` validation

**Files:**
- Modify: `ralph.py`

- [ ] **Step 1: Replace the `main` function**

Replace the entire `main()` function with:

```python
def main() -> None:
    config = load_config()

    project_path = Path(require(config, "project", "path")).expanduser().resolve()
    kanban_path  = Path(require(config, "project", "kanban")).expanduser().resolve()
    mode         = require(config, "task", "mode")
    max_iter     = config.get("loop", {}).get("max_iterations", 20)

    if not project_path.is_dir():
        abort(f"Project directory not found: {project_path}")
    if not kanban_path.is_file():
        abort(f"Kanban file not found: {kanban_path}")
    if mode not in MODES:
        abort(f"Invalid mode '{mode}' — must be 1, 2, or 3")

    if mode == "1":
        run_mode1(project_path, kanban_path, max_iter)
        return

    item = require(config, "task", "item")

    mode_label, prompt_file = MODES[mode]
    template_path = PROMPTS_DIR / prompt_file

    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode{mode}_{timestamp}.log"

    prompt = build_prompt(template_path, item, project_path, kanban_path)

    # ── Banner ─────────────────────────────────────────────────────────────────
    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    f"[bold]{mode}[/bold] — {mode_label}")
    info.add_row("Item",    item)
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Max",     f"{max_iter} iterations")
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    # ── Loop ───────────────────────────────────────────────────────────────────
    for iteration in range(1, max_iter + 1):
        console.print(Rule(f"[yellow]Iteration {iteration} / {max_iter}[/yellow]"))
        console.print()

        clean_exit, complete = run_claude(prompt, project_path, log_path)

        console.print()

        if complete:
            console.print(Panel(
                Text.assemble(
                    ("Finished in ", "white"),
                    (str(iteration), "bold green"),
                    (" iteration(s)\n\n", "white"),
                    ("Log: ", "dim"),
                    (str(log_path), "dim underline"),
                ),
                title="[bold green]COMPLETE[/bold green]",
                border_style="green",
            ))
            sys.exit(0)

        status = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
        console.print(f"  {status} — no completion signal. Looping...\n")

    # ── Max iterations hit ─────────────────────────────────────────────────────
    console.print(Panel(
        Text.assemble(
            ("Max iterations (", "white"),
            (str(max_iter), "bold red"),
            (") reached without completion.\n\n", "white"),
            ("Refine [task] item or the prompt templates in prompts/\n", "white"),
            ("Log: ", "dim"),
            (str(log_path), "dim underline"),
        ),
        title="[bold red]STOPPED[/bold red]",
        border_style="red",
    ))
    sys.exit(1)
```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: route mode 1 to run_mode1, skip item validation for mode 1"
```

---

### Task 7: Update `ralph.toml` and `PROMPT.md` comments

**Files:**
- Modify: `ralph.toml`
- Modify: `PROMPT.md`

- [ ] **Step 1: Update mode 1 comment in `ralph.toml`**

Change the comment block under `[task]` from:

```toml
# Mode to run:
#   1 = Implement a backlog item directly
#   2 = Create user stories from a backlog item
#   3 = Build from a specific user story
```

To:

```toml
# Mode to run:
#   1 = Implement all open feats from the kanban automatically (item field ignored)
#   2 = Create user stories from a backlog item
#   3 = Implement a specific user story by ID
```

- [ ] **Step 2: Update mode 1 row in `PROMPT.md`**

Change the modes table row from:

```markdown
| `1`  | Implement a FEAT (backlog item) directly |
```

To:

```markdown
| `1`  | Implement all open feats from the kanban automatically |
```

- [ ] **Step 3: Commit**

```bash
git add ralph.toml PROMPT.md
git commit -m "docs: update mode 1 description in config and readme"
```
