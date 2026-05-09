# Mode 2 Auto Story Writer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Mode 2 so it automatically discovers all open FEATs with no user stories and spawns a Claude instance per FEAT to write them, with retry logic and incremental git commits — no `item` config required.

**Architecture:** Add one new query function (`get_feats_without_stories`) and one new orchestrator (`run_mode2`) to `ralph.py`, then branch `main()` on `mode == "2"` before the `item` validation — mirroring the Mode 1 pattern exactly. No new files needed.

**Tech Stack:** Python 3.11+, `json` stdlib, `subprocess` (already used), `rich` (already used).

---

## File Map

| File | Change |
|------|--------|
| `ralph.py` | Add `get_feats_without_stories`; add `run_mode2`; update `main()` |
| `ralph.toml` | Update mode 2 comment |
| `PROMPT.md` | Update modes table and example |

---

### Task 1: Add `get_feats_without_stories` query function to `ralph.py`

**Files:**
- Modify: `ralph.py` (insert after line 104, after `get_open_stories`)

- [ ] **Step 1: Insert the new query function**

In `ralph.py`, locate the line:

```python
def get_unblocked_todos(stories: list[dict], kanban: dict) -> list[dict]:
```

Insert the following block immediately before it (leave one blank line between `get_open_stories` and the new function, and one blank line between the new function and `get_unblocked_todos`):

```python
def get_feats_without_stories(kanban: dict) -> list[dict]:
    return [
        t for t in kanban.get("tasks", [])
        if t.get("type") == "feat"
        and t.get("status") != "done"
        and t.get("children", []) == []
    ]

```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: add get_feats_without_stories query"
```

---

### Task 2: Add `run_mode2` orchestration function to `ralph.py`

**Files:**
- Modify: `ralph.py` (insert immediately before the `# ── Main ──` comment block at line 382)

- [ ] **Step 1: Insert `run_mode2` before `main()`**

Locate the comment line:

```python
# ── Main ───────────────────────────────────────────────────────────────────────
```

Insert the following block immediately before it:

```python
# ── Mode 2 orchestrator ────────────────────────────────────────────────────────

def run_mode2(
    project_path: Path,
    kanban_path: Path,
    max_iter: int,
    verbose: bool = False,
) -> None:
    template_path = PROMPTS_DIR / "create-userstories.md"
    if not template_path.exists():
        abort(f"Prompt template not found: {template_path}")

    LOGS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_path  = LOGS_DIR / f"mode2_{timestamp}.log"

    info = Table(box=box.SIMPLE, show_header=False, padding=(0, 1))
    info.add_column(style="bold cyan", no_wrap=True)
    info.add_column(style="white")
    info.add_row("Mode",    "[bold]2[/bold] — Write User Stories for All Feats")
    info.add_row("Project", str(project_path))
    info.add_row("Kanban",  str(kanban_path))
    info.add_row("Max",     f"{max_iter} iterations per feat")
    info.add_row("Log",     str(log_path))

    console.print()
    console.print(Panel(info, title="[bold cyan]Ralph Loop Executor[/bold cyan]", border_style="cyan"))
    console.print()

    kanban = load_kanban(kanban_path)
    feats  = get_feats_without_stories(kanban)

    if not feats:
        console.print(Panel(
            "[yellow]No open feats without user stories found in kanban.[/yellow]",
            border_style="yellow",
        ))
        return

    for feat in feats:
        feat_id    = feat["id"]
        feat_title = feat["title"]
        console.print(Rule(f"[cyan]FEAT {feat_id}: {feat_title}[/cyan]"))
        console.print()

        for attempt in range(1, max_iter + 1):
            console.print(Rule(f"[yellow]Attempt {attempt} / {max_iter}[/yellow]"))
            console.print()

            kanban = load_kanban(kanban_path)
            prompt = build_prompt(template_path, feat_title, project_path, kanban_path)
            clean_exit, complete = run_claude(prompt, project_path, log_path, verbose)
            console.print()

            if complete:
                if not git_commit(project_path, f"feat({feat_id}): write user stories for {feat_title}"):
                    console.print(f"  [yellow]Warning: git commit failed for {feat_id}.[/yellow]")
                console.print(f"  [green]{feat_id} done.[/green]\n")
                break

            status = "[green]clean exit[/green]" if clean_exit else "[yellow]non-zero exit[/yellow]"
            console.print(f"  {status} — no completion signal. Retrying...\n")
        else:
            console.print(Panel(
                f"[red]{feat_id} hit max attempts ({max_iter}) without completion — skipping.[/red]",
                border_style="red",
            ))


```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: add run_mode2 orchestration loop"
```

---

### Task 3: Update `main()` to branch on mode 2 and skip `item` validation

**Files:**
- Modify: `ralph.py` (lines ~401–405)

- [ ] **Step 1: Add mode 2 branch in `main()`**

Locate this block in `main()`:

```python
    if mode == "1":
        run_mode1(project_path, kanban_path, max_iter, verbose, max_workers)
        return

    item = require(config, "task", "item")
```

Replace it with:

```python
    if mode == "1":
        run_mode1(project_path, kanban_path, max_iter, verbose, max_workers)
        return

    if mode == "2":
        run_mode2(project_path, kanban_path, max_iter, verbose)
        return

    item = require(config, "task", "item")
```

- [ ] **Step 2: Commit**

```bash
git add ralph.py
git commit -m "feat: route mode 2 to run_mode2, skip item validation for mode 2"
```

---

### Task 4: Update `ralph.toml` and `PROMPT.md`

**Files:**
- Modify: `ralph.toml`
- Modify: `PROMPT.md`

- [ ] **Step 1: Update mode 2 comment in `ralph.toml`**

Locate:

```toml
#   2 = Create user stories from a backlog item
```

Replace with:

```toml
#   2 = Write user stories for all open feats with no stories (item field ignored)
```

- [ ] **Step 2: Update modes table in `PROMPT.md`**

Locate:

```markdown
| `2`  | Create user stories from a FEAT |
```

Replace with:

```markdown
| `2`  | Write user stories for all open feats automatically |
```

- [ ] **Step 3: Update mode 2 example in `PROMPT.md`**

Locate the example block:

```markdown
# Break down a FEAT into user stories
./ralph.sh \
  --kanban ~/myproject/TaskBoard/kanban.json \
  --project ~/myproject \
  --mode 2 \
  --item "Plans Management"
```

Replace with:

```markdown
# Write user stories for all open feats
./ralph.sh \
  --kanban ~/myproject/TaskBoard/kanban.json \
  --project ~/myproject \
  --mode 2
```

- [ ] **Step 4: Commit**

```bash
git add ralph.toml PROMPT.md
git commit -m "docs: update mode 2 description in config and readme"
```
