# Onboarding Name Screen — Design Spec

**Date:** 2026-05-12
**Branch:** feature/design-change-white
**Status:** Approved

---

## Purpose

First-time users see this screen before anything else. Sage introduces itself and collects the user's name — the only piece of data needed to personalise every subsequent session. Nothing else is collected here; scope is deliberately narrow.

---

## Screen Structure — Concept A: The Break

```
[Agent Classroom]
──────────────────────────────────────────

SAGE  |  Welcome.
      |  I'm Sage.

SAGE  |  Before we begin —
      |  what should I call you?

             ← flex spacer →

── Your name ──────────────────────────────

Your first name…                          →
```

### Top strip
- App name: `AGENT CLASSROOM` — IBM Plex Mono 10px, `#C8C8C8`, uppercase, tracking 0.14em
- No date, no counter, no back nav — this is a zero-context first visit
- Horizontal rule below: 1px `#F0F0F0`, margin `20px 28px 0`

### Sage turns (column grid)
Both turns use the standard 3-column grid: `72px label | 1px rule | 1fr speech`

| Turn | Content |
|------|---------|
| 1 | "Welcome.\nI'm Sage." |
| 2 | "Before we begin —\nwhat should I call you?" |

- Label: `SAGE` — IBM Plex Mono 9px, `#C8C8C8`, uppercase
- Vertical rule: 1px `#EFEFEF`
- Speech: Cormorant Garamond 20px / weight 300 / `#111` / line-height 1.55
- Turn 1 padding-top: 24px; Turn 2: 20px

### Flex spacer
`flex: 1` between the second Sage turn and the break section. Pushes the action zone to the lower half of the screen.

### Break section
Same `.break-section` pattern as the B-Break welcome screen.

**Divider:**
```
── Your name ──────────────────────────────
```
- Left line + label + right line using flexbox
- Label: `YOUR NAME` — IBM Plex Mono 8px, `#D4D4D4`, uppercase, tracking 0.14em
- Lines: 1px `#EFEFEF`

**Name input area** (`.b-redirect` pattern):
- Container padding: `18px 28px 0`
- Inner row: `border-top: 1px solid #F2F2F2`, `padding-top: 18px`, flex row
- Input: `flex: 1`, Cormorant Garamond italic 18px / weight 300 / `#111` / transparent bg / no border / no outline / resize none
- Placeholder: *"Your first name…"* — `color: #CFCFCF`
- Send arrow `→`: IBM Plex Mono 16px, `color: #D4D4D4` at rest → `#111` when field has content

### Bottom padding
`40px` below the input area.

---

## Interaction

| State | Behaviour |
|-------|-----------|
| Initial load | Input unfocused; placeholder visible; arrow dim `#D4D4D4` |
| Tap input | Keyboard appears; cursor placed at start; placeholder clears |
| Typing | Arrow darkens to `#111` as soon as `value.length > 0` |
| Submit (→ or Return) | Trim whitespace; if non-empty → save → navigate |
| Submit with empty field | No-op; no error state shown |

---

## Data Flow

**Storage:** `localStorage`

```
key:   "userName"
value: string  (trimmed, e.g. "Kaze")
```

**Guard (app entry):**
At app boot, read `localStorage.getItem("userName")`.
- `null` → show Onboarding Name screen
- Non-null → show B-Break Welcome screen with name pre-filled

**After submit:**
1. `localStorage.setItem("userName", trimmedName)`
2. Navigate to Welcome screen (B-Break) — no animation specified yet

---

## What Is Not Included

- Email, avatar, subject selection — deferred to future onboarding steps
- Back navigation — no previous screen exists
- Progress indicator — single step, none needed
- Error/validation messaging — empty submit is a silent no-op

---

## Design Token Reference

| Token | Value |
|-------|-------|
| Background | `#FFFFFF` |
| Primary ink | `#111111` |
| Muted labels | `#C8C8C8` |
| Placeholder text | `#CFCFCF` |
| Rules / borders | `#F0F0F0` – `#EBEBEB` |
| Sage speech font | Cormorant Garamond 300 |
| Label font | IBM Plex Mono |
| Utility font | DM Sans |

No accent colours. No shadows. No gradients.

---

## Relationship to Existing Screens

- Structurally identical to the B-Break Welcome screen — same column grid, same break section, same redirect-input pattern
- The only structural difference: the break action is an open text input instead of a named session button
- The regular B-Break Welcome screen is the destination immediately after this screen
- `SageTrigger.tsx` (Sage strip) is **not** shown on this screen — consistent with the existing rule that the Welcome screen has no bottom zone
