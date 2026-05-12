# FEAT-003: Reading Room Redesign — Full UI/UX Overhaul

**Status:** todo
**Blocked By:** —

---

## Problem Statement

The current AgentClassroom UI was built for function, not feel. Every screen uses its own ad-hoc layout — no shared typographic DNA, no unified bottom zone, no consistent way for Sage to speak. The app looks like a prototype, not a product. Students interacting with an AI tutor deserve an interface that feels considered: calm, premium, and focused. The existing screens also lack a personalised onboarding moment and a clear hierarchy between navigation and intelligence.

---

## Solution

Rebuild all screens to the locked "Reading Room" aesthetic: pure white backgrounds, a strict column grid (72 px label | 1 px rule | 1fr content), and a two-font palette (Cormorant Garamond for Sage's voice, IBM Plex Mono for all metadata). A new shared `SageTrigger` component owns the bottom of every screen — a warm 64 px strip that opens the Sage overlay from any context. Navigation controls sit in a 44 px row directly above `SageTrigger`, keeping position feedback and intelligence at thumb level. A new Onboarding Name screen gates first entry and personalises all subsequent greetings.

---

## User Stories

1. As a first-time user, I want to be greeted by Sage and asked for my name before the session begins, so that all subsequent interactions feel personal.
2. As a first-time user, I want to type my first name into an italic Cormorant input and submit with Return or the → arrow, so that the gesture feels light and intentional.
3. As a returning user, I want the app to remember my name from a previous session (via localStorage), so that I skip onboarding and land directly on the Welcome screen.
4. As a user on the Welcome screen, I want to see Sage's greeting, my session summary (topic, question count, level, estimated duration), and a single prominent "Begin" button, so that I understand exactly what I'm about to do.
5. As a user on the Welcome screen, I want a single italic redirect input ("Or tell Sage something different…") below the Begin button, so that I can change the session without hunting through menus.
6. As a user answering a question, I want to see the subject label and question text in a clean full-width layout with no column grid overhead, so that my reading focus stays on the question.
7. As a user answering a question, I want the answer options to use a letter + text format where selecting an option darkens it and the others fade, so that my selection is visually unambiguous.
8. As a user navigating questions, I want a ← PREV / progress bar / NEXT → nav row at the bottom of every question screen, so that I always know my position and can move forward or back without lifting my thumb to the top of the screen.
9. As a user on any screen, I want a warm Sage strip ("Ask me anything…") anchored at the very bottom, so that I can open a conversation with Sage at any moment without breaking flow.
10. As a user tapping the Sage strip, I want a full-screen overlay to slide up smoothly from below, so that the transition signals I've entered a deeper conversation mode.
11. As a user inside the Sage overlay, I want to see Sage's opening turn and a set of contextual quick-action options (e.g. "give you a hint", "skip this question"), so that I can act quickly without typing.
12. As a user inside the Sage overlay, I want to dismiss by dragging down or tapping the pill handle at the top, so that I can return to the question with a natural gesture — no back button needed.
13. As a user viewing results after a session, I want a clean receipt-style ledger showing Correct / Wrong / Skipped counts plus Score and Time, so that I can absorb my performance at a glance.
14. As a user viewing results, I want Sage's closing comment to appear below the data, followed by a "Your move" break section with a "Review answers →" button, so that the next action is unambiguous.
15. As a user on the Results screen, I want the Sage strip (without a nav row) anchored at the bottom, so that I can ask Sage about my performance before moving on.
16. As a user starting a review, I want to see all my answered questions as coloured circles in a 4×3 grid (BookMyShow-style), so that I can visually pattern-match which areas need attention.
17. As a user in the Review Grid, I want to filter circles by All / Wrong / Skipped / Correct using IBM Plex Mono tabs, so that I can focus on the subset that matters most.
18. As a user in the Review Grid, I want to tap any circle to open the Explanation screen for that question, so that I can drill into a specific answer without scrolling through a linear list.
19. As a user viewing an explanation, I want four clearly labeled sections (QUESTION, SELECTED, CORRECT, EXPLANATION) in a full-width layout, so that the comparison between what I picked and the right answer is immediately legible.
20. As a user on the Explanation screen, I want my selected answer dimmed (italic, `#C0C0C0`) and the correct answer in full ink (`#111`), so that the visual contrast signals the error without a red/green colour system.
21. As a user navigating explanations, I want ← PREV / progress / NEXT → nav above the Sage strip, so that I can step through all reviewed questions without returning to the grid.
22. As a user on the Explanation screen for a question I skipped, I want the SELECTED field to show an em dash instead of an answer, so that the blank is meaningful rather than confusing.
23. As a developer, I want a single `SageTrigger.tsx` component with a `showNav` prop, so that every screen gets identical Sage behaviour without code duplication.
24. As a developer, I want Cormorant Garamond and IBM Plex Mono loaded via Google Fonts and exposed as `--serif` and `--mono` CSS variables, so that every screen can reference the typefaces consistently.
25. As a developer, I want every screen component scoped to its own CSS namespace (e.g. `.question-card`, `.results-screen`), so that style isolation prevents cross-screen bleed.
26. As a developer, I want `SageSheet.tsx` to accept a `quickActions` prop (string array), so that contextual options can differ between Question Card, Results, and Review without modifying the sheet itself.

---

## Implementation Decisions

### New Components

- **`OnboardingName.tsx`** — first-entry name collection screen. Column grid, two Sage turns, flex spacer, `.b-redirect`-style name input. Shown when `localStorage.userName` is null. On submit, saves name and navigates to Welcome. No Sage strip.
- **`SageTrigger.tsx`** — shared bottom zone. Two stacked rows: nav row (44 px, `border-top: 1px #F0F0F0`) + Sage strip (64 px, `background: #F9F9F7`, `border-top: 1px #E8E8E0`). `showNav={false}` hides the nav row. Props: `onAskSage`, `onPrev`, `onNext`, `canGoPrev`, `canGoNext`, `progress` (0–1), `showNav`.
- **`SageSheet.tsx`** — full-screen overlay (replaces CompanionSheet). Pill handle dismiss (36×4 px, `#E0E0E0`). Column grid for Sage turns + YOU input. Props: `quickActions: string[]`, `onDismiss`. Slide-up animation via CSS transition or react-spring.
- **`ExplanationScreen.tsx`** — four-field layout scoped to `.explanation-screen`. Props: `question`, `selectedAnswer` (null if skipped), `correctAnswer`, `explanation`, `questionIndex`, `totalQuestions`, `onPrev`, `onNext`, `onAskSage`, `canGoPrev`, `canGoNext`.

### Rewritten Components

- **`WelcomeScreen.tsx`** — B-Break structure. Column grid Sage turns, flex spacer, "Your move" break section, single `.b-redirect` redirect input at bottom. No Sage strip.
- **`QuestionCard.tsx`** — no column grid in body. Subject label (IBM Plex Mono 9 px uppercase), Cormorant question (21 px/300), option letter (IBM Plex Mono 9 px `#CFCFCF`) + option text (Cormorant 18 px `#888`). Selected option: letter + text → `#111`; unselected fade → `opacity: 0.3`. `SageTrigger` with `showNav={true}` at bottom.
- **`ResultsScreen.tsx`** — IBM Plex Mono receipt table (no column grid in data zone). `ledger-label` / `ledger-value` / `ledger-value-dim` / `ledger-rule` CSS classes. `flex: 1` spacer pushes Sage turn to bottom of content area. `SageTrigger` with `showNav={false}`.
- **`ReviewGrid.tsx`** — `display: grid; grid-template-columns: repeat(4, 1fr)`. Circles via `aspect-ratio: 1; border-radius: 50%`. Outcome classes: `.seat--correct`, `.seat--wrong`, `.seat--skipped`. Filter strip with IBM Plex Mono tabs. `SageTrigger` with `showNav={true}`.

### App Entry Guard

- Read `localStorage.getItem("userName")` at boot.
- `null` → render `OnboardingName`. Non-null → render `WelcomeScreen`.
- This logic lives in the top-level `App.tsx` or a new `AppRouter.tsx`.

### Design System Bootstrap

- Add Cormorant Garamond (weights 300, 400) + IBM Plex Mono (weights 400, 500) to `index.html` Google Fonts link.
- Add `--serif`, `--mono` CSS variables to `:root` in `index.css`.
- Column grid utility: `.col-grid { display: grid; grid-template-columns: 72px 1px 1fr; gap: 16px }`.
- Top strip utility: `.top-strip { display: flex; justify-content: space-between; align-items: center; padding: 16px 28px }`.

### Deletions

- `CompanionSheet.tsx` — replaced by `SageSheet.tsx`. Delete file after migration.
- All concept HTML mockup files at project root (`*.html`) — reference artefacts; do not ship.

---

## Testing Decisions

Good tests verify observable user-facing behaviour, not implementation details. They do not test CSS class names or internal state shape — only what the user sees and what functions are called.

### What to test

- **`OnboardingName`**: empty submit is a no-op; non-empty submit calls `onSubmit(name)` with trimmed value; Return key submits; arrow darkens only when field has content.
- **`SageTrigger`**: renders only Sage strip when `showNav={false}`; renders both rows when `showNav={true}`; `onPrev` / `onNext` are called on click; PREV button has `pointer-events: none` when `canGoPrev={false}`; progress bar width reflects `progress` prop.
- **`SageSheet`**: renders quick actions list; selecting an action fades the others; `onDismiss` is called on pill click; text input submit calls the correct handler.
- **`ReviewGrid`**: filter "WRONG" shows only wrong seats; tapping a seat calls `onOpenExplanation(questionId)`; legend dots are present for each outcome.
- **`ExplanationScreen`**: renders em dash in SELECTED when `selectedAnswer` is null; `onNext` disabled when `canGoNext={false}`; `onPrev` called on prev button click.

### Prior art

- Existing tests in `agent-classroom/src/` (filter tests, `useQuestionFeed` tests) use React Testing Library + Vitest — follow the same pattern.
- Avoid snapshot tests for styled components — they break on design iteration.

---

## Out of Scope

- Backend, authentication, or cloud sync — all data remains client-side.
- Animation polish beyond the Sage overlay slide-up (spring physics, parallax, etc.).
- Dark mode / theming — pure white only for this redesign.
- Session history or multi-session tracking.
- Tablet or desktop layout optimisation beyond max-width 390 px container.
- Replacing the static JSON question bank with a live API.

---

## Further Notes

- All locked design references live in `docs/design-handoff.md` and `docs/superpowers/specs/`.
- Concept HTML mockup files at the project root (`question-concepts.html`, `results-concepts.html`, etc.) are visual references — they are not deployed.
- The implementation order suggested in the handoff doc: `SageTrigger.tsx` first (shared dependency), then screen-by-screen top-to-bottom through the user journey: Onboarding → Welcome → QuestionCard → SageSheet → Results → ReviewGrid → Explanation.
- Branch: `feature/design-change-white`.
