# Ralph Loop Executor

A CLI tool that runs Claude Code in an autonomous loop against your kanban board.

## Usage

```bash
./ralph.sh --kanban <path-to-kanban.json> --project <path-to-project> --mode <1|2|3> --item <name> [--max <iterations>]
```

## Modes

| Mode | What it does |
|------|-------------|
| `1`  | Implement all open feats from the kanban automatically |
| `2`  | Write user stories for all open feats automatically |
| `3`  | Build from a specific user story (by ID) |

## Examples

```bash
# Write user stories for all open feats
./ralph.sh \
  --kanban ~/myproject/TaskBoard/kanban.json \
  --project ~/myproject \
  --mode 2

# Build a specific user story
./ralph.sh \
  --kanban ~/myproject/TaskBoard/kanban.json \
  --project ~/myproject \
  --mode 3 \
  --item "US-001" \
  --max 30

# Implement a FEAT directly
./ralph.sh \
  --kanban ~/myproject/TaskBoard/kanban.json \
  --project ~/myproject \
  --mode 1 \
  --item "Plans Management"
```

## How It Works

1. Ralph reads your `kanban.json` and injects it into the appropriate mode prompt
2. A fresh Claude Code instance is spawned inside your project directory with `--dangerously-skip-permissions`
3. Claude works until it outputs `<promise>COMPLETE</promise>` or max iterations is reached
4. Each iteration runs in a fresh context window — state is preserved through files and git

## Kanban Format

Your `kanban.json` must follow the TaskBoard schema. See `.claude/taskboard-guidelines.md` in each project for the full spec. Minimal structure:

```json
{
  "project": "my-project",
  "tasks": [
    {
      "id": "FEAT-001",
      "type": "feat",
      "title": "Plans Management",
      "status": "todo",
      "blocked": [],
      "children": []
    }
  ]
}
```

### Status values
- `todo` — not started
- `inprogress` — actively being worked on
- `done` — completed

### Folder convention
Detail files are derived from the task ID — no `link` field needed in the JSON:
- `feats/FEAT-001.md`
- `user-stories/US-001.md`

## Logs

Each run writes a full log to `logs/<mode>_<timestamp>.log`.
