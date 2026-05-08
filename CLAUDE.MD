# TaskBoard JSON Schema

## Top-Level Structure

```json
{
  "project": "<repo-name>",
  "tasks": [ ... ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `project` | string | Repository/project name |
| `tasks` | array | All top-level task items |

---

## Task Fields

Every task node — at any level — has these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier. Format: `{PREFIX}-{3-digit-padded}` e.g. `FEAT-001` |
| `type` | string | yes | Task type. See allowed values below |
| `title` | string | yes | Short human-readable description |
| `status` | string | yes | Current state. One of: `todo`, `inprogress`, `done` |
| `blocked` | array | yes | IDs of tasks that must be completed before this one. Empty array `[]` if none |
| `children` | array | conditional | Sub-tasks. Present only on `feat` nodes |

---

## Allowed Types

| Type | Prefix | Level | Can Have Children |
|------|--------|-------|-------------------|
| `feat` | `FEAT` | top-level | yes |
| `user-story` | `US` | child of `feat` | yes |

---

## Hierarchy

```
feat       →  children: user-story
```

---

## ID Rules

- Format: `{PREFIX}-{3-digit-zero-padded}` — e.g. `FEAT-001`, `US-012`
- Counters are **per-type** — each type has its own independent sequence starting at `001`
- IDs are globally unique across the entire board (prefix ensures no collision)
- The `type` field and the ID prefix must always match

---

## `blocked` Field Rules

- References IDs at the **same hierarchy level** only
- A `user-story` can be blocked by another `user-story`, not by a `feat`
- Cross-level blocking is implicit: a child cannot start if its parent is blocked

---

## Folder Convention

Each task type has a dedicated folder. Markdown detail files are named by ID:

| Type | Folder | Example |
|------|--------|---------|
| `feat` | `feats/` | `feats/FEAT-001.md` |
| `user-story` | `user-stories/` | `user-stories/US-001.md` |


File path for any task is always derivable as `{type-plural}/{id}.md` — no `link` field needed in the JSON.
