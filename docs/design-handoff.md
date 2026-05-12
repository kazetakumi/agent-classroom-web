# Design Session Handoff

## Branch
`feature/design-change-white`

## What we're doing
Redesigning the AgentClassroom app screen by screen with a minimalist white, premium, AI-first aesthetic. The AI (named **Sage**) is the central character — it greets the user by name, generates all content, and has a consistent voice. The user is **Kaze**.

## Design System (locked)

**Typography**
- `Cormorant Garamond` 300–400 — Sage's speech, serif body text, redirect input
- `IBM Plex Mono` — all labels, keys, metadata, timestamps (9–11px, uppercase, tracked)
- `DM Sans` 300–500 — utility text only

**Color** — pure white only, zero accent colours
- Background: `#FFFFFF`
- Ink: `#111111`
- Labels/muted: `#C8C8C8`–`#D8D8D8`
- Rules/borders: `#F0F0F0`–`#EBEBEB`

**Column Grid**
- `grid-template-columns: 72px 1px 1fr` · gap: `16px`
- Left col: speaker labels (IBM Plex Mono, 9px, uppercase, `#C8C8C8`)
- Centre: 1px vertical rule `#EFEFEF`
- Right col: speech / content (Cormorant)

## Onboarding Name Screen — locked (Concept A: The Break)

First-time entry point. Shown when `localStorage.userName` is `null`. After submit, saves name and navigates to the B-Break Welcome screen. No Sage strip at bottom (same rule as Welcome).

Spec: `docs/superpowers/specs/2026-05-12-onboarding-name-design.md`

Structure:
```
[Agent Classroom]
───────────────────────────────────────────────

SAGE  |  Welcome.
      |  I'm Sage.

SAGE  |  Before we begin —
      |  what should I call you?

                    ← flex spacer →

── Your name ───────────────────────────────────

Your first name…                              →
```

Key decisions:
- Top strip: app name only — no date, no counter (zero context on first visit)
- Two Sage turns in the standard column grid (72px label | 1px rule | 1fr speech)
- `flex: 1` spacer pushes break section to lower half of screen
- Break divider label: `YOUR NAME` (vs `YOUR MOVE` on the Welcome screen)
- Name input: same `.b-redirect` pattern — italic Cormorant 18px / `#CFCFCF` placeholder, `→` send arrow
- Arrow: `#D4D4D4` at rest, darkens to `#111` when field has content
- Submit (→ or Return): trim whitespace → if non-empty, `localStorage.setItem("userName", name)` → navigate to Welcome
- Empty submit: silent no-op
- No Sage strip, no back nav, no progress indicator

App entry guard:
- Read `localStorage.getItem("userName")` at boot
- `null` → show Onboarding Name screen
- Non-null → show B-Break Welcome screen with name pre-filled

---

## Welcome Screen — locked (B-Break)

Structure:
```
[Agent Classroom]                     [10 May]
───────────────────────────────────────────────

SAGE  |  Good morning, Kaze. I've prepared
      |  something for you today.

SAGE  |  Here's your session —
      |  Topic      Calculus Foundations
      |  Questions  12 · Level A2
      |  Duration   ~9 minutes

SAGE  |  Ready when you are.

── Your move ───────────────────────────────────

Calculus Foundations
12 questions · ~9 min · Level A2
[ Begin this session                         → ]

───────────────────────────────────────────────
Or tell Sage something different…            ↑
```

Key decisions:
- "Your move" label marks the grid-collapse / dialogue-to-action shift
- Full-width `#111` begin button is the **only** dark element
- Single italic Cormorant redirect input at bottom — no chips, no column grid

## Sage Standalone Component — locked (Treatment 3: The Invitation)

Concept file: `sage-nav-above.html` (Treatment 3, rightmost phone)

The Sage trigger is a **standalone component** independent of each screen's layout. It always occupies the bottom of the screen as a two-part stacked zone:

```
───────────────────────────────────────────────   border-top: 1px #F0F0F0
← PREV  ────────████░░────────────  NEXT →        nav row: 44px
───────────────────────────────────────────────   border-top: 1px #E8E8E0
SAGE  |  Ask me anything…                    ↑   Sage strip: 64px, bg #F9F9F7
```

Key decisions:
- **Two distinct rows form one bottom zone.** Nav row sits directly above Sage strip. The material shift (white nav → warm Sage strip) marks the boundary between navigation and intelligence.
- **Top strip stays purely passive:** `[AGENT CLASSROOM]` left, `[3/12]` right, nothing else — no progress bar, no nav buttons at the top
- **Progress bar lives inside the nav row**, flanked by `← PREV` and `NEXT →` — groups position feedback with navigation controls
- **Nav row** (44px, `border-top: 1px solid #F0F0F0`): `← PREV` | 1px `#BDBDBD` progress fill on `#F0F0F0` track | `NEXT →`
  - Active btn: IBM Plex Mono 8px uppercase, `#999`, hover `#111`
  - Disabled btn: `#D0D0D0`, `pointer-events: none`
- **Sage strip** (64px, `background: #F9F9F7`, `border-top: 1px solid #E8E8E0`): column grid
  - `SAGE` — IBM Plex Mono 9px uppercase, `#BBBBBB`, left
  - `1px` vertical rule, `#E0E0D8`
  - Italic Cormorant placeholder *"Ask me anything…"* — 17px / 300, `#C4C4C4`
  - `↑` send arrow — IBM Plex Mono 13px, `#CCCCCC`, right
  - Hover: strip → `#F5F5F2`, placeholder → `#888`, arrow → `#888`
- Tapping anywhere in the Sage strip opens the Sage overlay (full-screen, slides up)

**Screen adaptations:**
- **Question Card, Review Grid, Explanation:** full two-row zone — nav row + Sage strip
- **Results:** Sage strip only — no nav row (no prev/next on Results)
- **Welcome:** no bottom zone — redirect input already serves as Sage's entry point

**New component:** `SageTrigger.tsx` — encapsulates both rows, accepts `onAskSage`, `onPrev`, `onNext`, `canGoPrev`, `canGoNext`, `progress` (0–1), `showNav` (false on Results)

---

## Question Card — locked (Annotated + Nav/Sage Bottom Zone)

Concept file: `question-concepts.html` (3 base concepts) → `question-concepts-2.html` (3 annotated variations)

Locked structure:
```
[Agent Classroom]                     [3 / 12]

CALCULUS FOUNDATIONS

A particle moves along the x-axis with velocity
v(t) = 3t² − 6t. At what time is the particle
at rest?

───────────────────────────────────────────────

A   t = 0 only
B   t = 2 only
C   t = 0 and t = 2
D   t = 1 and t = 3

───────────────────────────────────────────────   border-top: 1px #F0F0F0
← Prev  ────████░░────────────────  Next →        nav row: 44px
───────────────────────────────────────────────   border-top: 1px #E8E8E0
SAGE  |  Ask me anything…                    ↑   Sage strip: 64px, #F9F9F7
```

Key decisions:
- **No column grid** — question occupies full content width
- `CALCULUS FOUNDATIONS` subject label in IBM Plex Mono 9px uppercase above question
- Question in Cormorant Garamond 21px / 300 weight
- Single `#EFEFEF` rule divides question from options
- Options: IBM Plex Mono letter (9px, `#CFCFCF`) + Cormorant text (18px, `#888`)
- Selected option: letter darkens to `#111`, text darkens to `#111`
- Unselected options fade to `opacity: 0.3` after pick
- Bottom zone: `SageTrigger` component with `showNav={true}`
- Top-right counter: `3 / 12` in IBM Plex Mono 9px

**Props to add to QuestionCard:**
- `onPrev: () => void` — wraps `feed.goBack`
- `onNext: () => void` — wraps `feed.skip`; if already answered, cancels timer and calls `onAdvance()` instead
- `onAskSage: () => void` — opens SageSheet
- `canGoPrev: boolean` — `currentIndex > 0`
- `progress: number` — `currentIndex / totalQuestions`

**Implementation notes:**
- Add `Cormorant Garamond` + `IBM Plex Mono` to `index.html` Google Fonts link
- Add `--mono` + `--serif` CSS variables to `index.css`
- QuestionCard.css rewrite: scoped to `.question-card` namespace

## Ask Sage Sheet — locked (Full Screen + Pill Handle dismiss)

Concept files: `sage-concepts.html` → `sage-concepts-2.html` → `sage-concepts-3.html`

This is a **general-purpose overlay** accessible from any screen — not tied to the question card. It covers the previous screen entirely.

Locked structure:
```
         ─────          ← pill handle (36×4px, #E0E0E0, centred)

AGENT CLASSROOM

────────────────────────────────────────────────

SAGE  |  Ask me anything. Or I can —

      |  — give you a hint
      |  — skip this question
      |  — walk through the concept
      |  — end the session

────────────────────────────────────────────────
YOU   |  Or ask anything…                      ↑
```

Key decisions:
- **Full screen** — covers the entire previous screen, no question visible behind
- **Dismiss: Pill Handle** — centred 36×4px grey pill (`#E0E0E0`) at the very top, before app name. Drag down to dismiss. No label, no back button — gesture is the navigation
- No `← Question` or `← Back` label — the pill is entry-point agnostic (works from any screen)
- App name `AGENT CLASSROOM` below the pill, left-aligned, IBM Plex Mono as usual
- **Quick actions: Sage Offers** — Cormorant italic phrases continuing Sage's opening sentence: *"Ask me anything. Or I can —"*. Each option prefixed with `—` em-dash. Tapping selects it, others fade to `opacity: 0.28`
- Quick action options (can be contextual per screen):
  - *give you a hint*
  - *skip this question*
  - *walk through the concept*
  - *end the session*
- Free-text input at bottom: column grid, `YOU | rule | italic Cormorant placeholder + ↑ send`
- Conversation grows upward in column grid as user and Sage exchange turns

**Implementation notes:**
- This is a new component: `SageSheet.tsx` — not the existing `CompanionSheet`
- `onAskSage` prop in QuestionCard opens this sheet
- Quick action list should be passed as props so it's reusable across screens
- Dismiss: swipe-down gesture + tapping the pill. Consider `react-spring` or CSS transition for the slide animation

## Results Screen — locked (C: The Ledger)

Concept file: `results-concepts.html` (C frame, third phone)

Data speaks first. Sage speaks last.

```
[Agent Classroom]                    [10 May]
──────────────────────────────────────────────

CALCULUS FOUNDATIONS · 12 QUESTIONS

CORRECT                                      9
WRONG                                        2
SKIPPED                                      1
──────────────────────────────────────────────
SCORE                                    9 / 12
TIME                                     6M 42S

──────────────────────────────────────────────

SAGE  |  Two to review. Ready when you are.

── Your move ──────────────────────────────────

[Review answers                           →]

──────────────────────────────────────────────   border-top: 1px #E8E8E0
SAGE  |  Ask me anything…                    ↑   Sage strip: 64px, #F9F9F7
```

Key decisions:
- **No column grid in the data zone** — IBM Plex Mono receipt table only
- `ledger-subject`: IBM Plex Mono 9px uppercase, `#BBBBBB` — topic + question count header
- `ledger-label` (left): IBM Plex Mono 9px uppercase, `#C8C8C8`
- `ledger-value` (right): IBM Plex Mono 13px / weight 500, `#111`
- `ledger-value-dim`: IBM Plex Mono 13px, `#ABABAB` — Skipped row de-emphasised
- `ledger-rule` (1px `#F0F0F0`) separates Correct/Wrong/Skipped from Score/Time summary rows
- `flex: 1` spacer in `c-content` pushes Sage's turn to bottom of content area
- Horizontal rule before Sage's turn (1px `#F0F0F0`, margin `0 28px`)
- Column grid turn: Sage's closing line — Cormorant 20px / 300 weight
- **Break section**: "Your move" divider + full-width dark button `Review answers →`
- **Bottom zone:** `SageTrigger` with `showNav={false}` — Sage strip only, no nav row (Results has no prev/next)
- No ghost secondary — removed

**Implementation notes:**
- `ResultsScreen.tsx` rewrite: scoped to `.results-screen` namespace
- Data props: `correct`, `wrong`, `skipped`, `totalAttempted`, `durationSeconds` (already on `SessionSummary`)
- Primary action: `onReviewQuestions`
- `onAskSage: () => void` — opens SageSheet
- `formatDuration` helper already exists in current `ResultsScreen.tsx`

## Review Grid — locked (D: Seat Map)

Concept file: `review-concepts.html` (D frame, fourth phone)

BookMyShow-style seat grid. All questions visible at once as coloured circles.

```
[Agent Classroom]                  [← Results]
──────────────────────────────────────────────

ALL 12   WRONG 2   SKIPPED 1   CORRECT 9

──────────────────────────────────────────────

        ①  ②  ③  ④
        ⑤  ⑥  ⑦  ⑧
        ⑨  ⑩  ⑪  ⑫

        ●  Correct   ●  Wrong   ●  Skipped

──────────────────────────────────────────────   border-top: 1px #F0F0F0
← Prev  ────████░░────────────────  Next →        nav row: 44px
──────────────────────────────────────────────   border-top: 1px #E8E8E0
SAGE  |  Ask me anything…                    ↑   Sage strip: 64px, #F9F9F7
```

Key decisions:
- **4×3 grid of circles**, one per question number, vertically centred in screen
- Circle fills: correct = `rgba(117,158,126,0.18)` (muted sage), wrong = `rgba(171,102,102,0.20)` (muted rose), skipped = `#F3F3F3` (ghost grey)
- Numbers: Cormorant Garamond 300 / 24px, centred; correct = `#4E7A5A`, wrong = `#8B4848`, skipped = `#C8C8C8`
- Legend below grid: 8px coloured dots + IBM Plex Mono 8px uppercase labels
- **Filter strip** (IBM Plex Mono tabs with counts): `ALL · 12 | WRONG · 2 | SKIPPED · 1 | CORRECT · 9` — active tab = `#111`, inactive = `#D0D0D0`
- **Back nav**: `← RESULTS` replaces the date in top-strip (right side)
- **Bottom zone:** `SageTrigger` with `showNav={true}` — nav row (`← PREV | progress | NEXT →`) above Sage strip; prev/next dimmed when no more items
- All 12 visible on one page — no pagination needed at 12Q

**Implementation notes:**
- `ReviewGrid.tsx` rewrite, scoped to `.review-grid` namespace
- Grid: `display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0 28px`
- Seat: `aspect-ratio: 1; border-radius: 50%` — circle via aspect ratio, no fixed height
- Filter hides/shows seats by outcome (no re-paginate — all seats always rendered, opacity/display toggle)
- `onOpenExplanation(questionId)` fires on seat tap
- Outcome className: `.seat--correct` / `.seat--wrong` / `.seat--skipped`
- `computeOutcome` helper already exists in current `ReviewGrid.tsx`
- `questionNumber` helper already exists — strip to bare integer for display inside circle

## Explanation Screen — locked (A: Four Fields)

Concept file: `explanation-concepts-2.html` (A frame)

Entry point: tapping a seat in the Review Grid → `onOpenExplanation(questionId)`

```
[Agent Classroom]                [← Review]
──────────────────────────────────────────────

QUESTION · 3 OF 12

A particle moves along the x-axis with velocity
v(t) = 3t² − 6t. At what time is the particle at rest?

──────────────────────────────────────────────

SELECTED
t = 0 only

CORRECT
t = 0 and t = 2

──────────────────────────────────────────────

EXPLANATION
The particle is at rest when velocity equals zero.
Setting 3t² − 6t = 0 and factoring gives t(3t − 6) = 0,
so t = 0 or t = 2. Both are valid — the particle stops
at the origin and again when it reverses at t = 2.

──────────────────────────────────────────────   border-top: 1px #F0F0F0
← Prev  ────████░░────────────────  Next →        nav row: 44px
──────────────────────────────────────────────   border-top: 1px #E8E8E0
SAGE  |  Ask me anything…                    ↑   Sage strip: 64px, #F9F9F7
```

Key decisions:
- **No column grid anywhere** — all four fields are full-width `.field-block` sections
- **Back nav**: `← REVIEW` in top-strip right (same pattern as `← RESULTS` in Review Grid)
- **Four labeled sections**, each with IBM Plex Mono 9px uppercase `#C8C8C8` label:
  - `QUESTION · N OF 12` — Cormorant 19px/300, `#111`, line-height 1.6
  - `SELECTED` — Cormorant 18px/300 italic, `#C0C0C0` (dim — signals wrong)
  - `CORRECT` — Cormorant 18px/300 italic, `#111` (full ink — signals right)
  - `EXPLANATION` — Cormorant 18px/300, `#444`, line-height 1.7
- Rule (`1px #F0F0F0`, margin `20px 28px 0`) separates question from answer fields, and answer fields from explanation
- `SELECTED` and `CORRECT` share a block with no rule between them — they read as a pair
- **Bottom zone:** `SageTrigger` with `showNav={true}` — nav row + Sage strip
- Skipped question: `SELECTED` block shows `—` (em dash) in dim italic instead of an answer text

**Implementation notes:**
- New component: `ExplanationScreen.tsx`, scoped to `.explanation-screen` namespace
- Props: `question: string`, `selectedAnswer: string | null`, `correctAnswer: string`, `explanation: string`, `questionIndex: number`, `totalQuestions: number`, `onPrev: () => void`, `onNext: () => void`, `onAskSage: () => void`, `canGoPrev: boolean`, `canGoNext: boolean`
- `selectedAnswer` is `null` for skipped questions — render `—` in the SELECTED field
- `onOpenExplanation(questionId)` in ReviewGrid fires this screen

## Screens — status

| Screen | File | Status |
|--------|------|--------|
| Onboarding (name) | `agent-classroom/src/components/OnboardingName.tsx` | 🔒 Design locked, not implemented |
| Welcome | `welcome-concepts.html` | ✅ Locked |
| Question Card | `agent-classroom/src/components/QuestionCard.tsx` | 🔒 Design locked, not implemented |
| Sage Trigger (standalone) | `agent-classroom/src/components/SageTrigger.tsx` | 🔒 Design locked, not implemented |
| Sage Sheet (overlay) | `agent-classroom/src/components/SageSheet.tsx` | 🔒 Design locked, not implemented |
| Results | `agent-classroom/src/components/ResultsScreen.tsx` | 🔒 Design locked, not implemented |
| Review Grid | `agent-classroom/src/components/ReviewGrid.tsx` | 🔒 Design locked, not implemented |
| Explanation | `agent-classroom/src/components/ExplanationScreen.tsx` | 🔒 Design locked, not implemented |
| Companion Sheet | `agent-classroom/src/components/CompanionSheet.tsx` | 🗑 Deleted — not needed |

## App facts
- Mobile-first, max-width 390px, responsive to tablet
- React 19 + vanilla CSS (no Tailwind, no shadcn)
- State machine in `src/questionFeed/useQuestionFeed.ts`
- Concept HTML mockups live at project root before React implementation

## How to continue
1. All six screens locked + Sage standalone component locked
2. Companion Sheet deleted — not needed
3. `SageTrigger.tsx` is the new shared component: warm bottom strip + nav row above it. Used by Question Card, Review Grid, and Explanation (`showNav={true}`); Results uses it with `showNav={false}`.
4. Next step: implement the locked designs in React — start with `SageTrigger.tsx` as it's shared by all screens
