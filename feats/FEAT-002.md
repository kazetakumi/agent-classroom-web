# FEAT-002: Detailed Results View

## Problem Statement

After completing a revision session, students see only aggregate stats (correct / wrong / skipped counts and duration). There is no way to review which specific questions they got right, wrong, or skipped, nor to read an explanation for any question. Students cannot learn from their mistakes directly within the results flow.

## Solution

Extend the post-session results flow with two new screens:

1. **Detailed Results Screen** — a seat-map style grid where each attended question is represented as a numbered tile coloured by outcome (green = correct, red = wrong, amber = skipped). Students get an immediate visual fingerprint of their session performance.

2. **Explanation Screen** — tapping any tile opens a per-question detail screen showing the full question text, all four options (the student's selected answer highlighted in red if wrong, the correct answer highlighted in green), and a written explanation sourced from a static explanations data file.

Navigation is back-only: Explanation → Detailed Results → Summary. No inter-question arrows on the explanation screen.

## User Stories

1. As a student, I want to see a "Review Questions" button on the summary results screen, so that I can opt into the detailed view after reviewing my score.
2. As a student, I want to see each attended question represented as a numbered tile in a grid, so that I get a visual overview of my session at a glance.
3. As a student, I want correctly answered questions shown in green, so that I can quickly identify my strengths.
4. As a student, I want incorrectly answered questions shown in red, so that I know which areas need more work.
5. As a student, I want skipped questions shown in amber, so that I can distinguish incomplete attempts from wrong answers.
6. As a student, I want the tiles ordered by the sequence in which I encountered the questions during the session, so that I can mentally replay my session.
7. As a student, I want to tap any tile and be taken to an explanation screen for that question, so that I can learn from my mistakes.
8. As a student, I want the explanation screen to show the full question text, so that I have context for the answer.
9. As a student, I want all four answer options displayed on the explanation screen, so that I can see the full choice landscape.
10. As a student, I want my selected answer highlighted in red (if wrong) on the explanation screen, so that I can immediately see what I got wrong.
11. As a student, I want the correct answer highlighted in green on the explanation screen, so that I know the right answer without searching.
12. As a student, I want a written explanation shown below the options on the explanation screen, so that I understand why the correct answer is right.
13. As a student, I want a back button on the explanation screen that returns me to the detailed results grid, so that I can continue reviewing other questions.
14. As a student, I want a back button on the detailed results screen that returns me to the summary screen, so that I can get back to the start-again / done options.
15. As a student, I want the explanation screen to also display the correct answer when I skipped the question, so that I still learn even for questions I did not attempt.
16. As a student, I want the number shown on each tile to reflect the 1-based position in my session (not the raw question ID), so that the grid is easy to scan numerically.

## Implementation Decisions

### Data

- A new static explanations data file keyed by question ID (matching the IDs in the existing question bank) provides explanation text for each question.
- Each entry contains a written explanation of the correct answer (2–4 sentences).
- The question bank and explanations data file remain decoupled — the explanation lookup is performed by ID at render time.

### Navigation / State Machine

- The existing feed state machine (`useQuestionFeed`) is extended with two new fields on the `ended` state:
  - `view`: `'summary' | 'review' | 'explanation'` — defaults to `'summary'` when a session ends.
  - `selectedQuestionId`: `string | null` — populated when the student taps a tile.
- New actions exposed by the hook: `openReview()`, `openExplanation(questionId)`, `closeExplanation()`.
- `startAgain()` and `returnToIdle()` reset `view` to `'summary'` and `selectedQuestionId` to `null`.

### Session Record ordering

- The detailed results grid renders tiles in the order that questions were attended during the session. The existing `session: SessionRecord[]` array (append-only, deduplicated by last-write-wins) provides this order. Deduplication logic in `computeSummary` is reused for display.

### Components

- **`DetailedResultsScreen`** — receives the ordered list of attended questions with their outcome (`correct | wrong | skipped`) and callbacks for `onBack` and `onSelectQuestion`. Renders a CSS grid of coloured tiles.
- **`ExplanationScreen`** — receives the question object, the student's selected option, the correct option, the explanation text, and an `onBack` callback. Stateless display component.
- **`ResultsScreen`** — gains an `onReview` prop and a "Review Questions" button.

### Colours

| Outcome | Background | Text |
|---------|-----------|------|
| Correct | `#d1fae5` (green-100) | `#065f46` (green-800) |
| Wrong | `#fee2e2` (red-100) | `#991b1b` (red-800) |
| Skipped | `#fef3c7` (amber-100) | `#92400e` (amber-800) |

These reuse the palette already established in `ResultsScreen`.

## Testing Decisions

Good tests verify external behaviour — what a component renders and what callbacks it fires — not internal implementation details like state shape.

### Modules to test

- **`useQuestionFeed`** — extend existing hook tests to cover `openReview`, `openExplanation`, `closeExplanation` transitions, and that `selectedQuestionId` is populated/cleared correctly.
- **`DetailedResultsScreen`** — render with a known session, assert correct tile count, correct colour assignment per outcome, and that `onSelectQuestion` fires with the right question ID on tile click.
- **`ExplanationScreen`** — render with a correct answer, wrong answer, and skipped scenario; assert correct answer is highlighted green, user's wrong pick is highlighted red, explanation text is present.

### Prior art

Existing component tests (`QuestionCard.test.tsx`, `CompanionSheet.test.tsx`) and hook tests (`useQuestionFeed.test.ts`) use Vitest + React Testing Library — new tests follow the same pattern.

## Out of Scope

- AI-generated explanations (explanations are static JSON only).
- Inter-question navigation arrows on the explanation screen (back-to-grid is the only navigation).
- Questions not attended during the session do not appear in the grid.
- Persisting session history across app reloads.
- Filtering or sorting tiles by outcome.

## Further Notes

- The current branch `feature/detailed-result-view` is already created for this work.
- The existing `ResultsScreen` summary view (stat cards + duration) is preserved unchanged; the detailed view is additive.
- Tile numbers are 1-based session positions, not raw question IDs, to keep the grid readable.
