# Reading Room Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current dark purple gaming aesthetic with a warm, editorial "Reading Room" identity across all 5 app screens.

**Architecture:** Pure CSS overhaul — no Tailwind, no structural changes to routing or state machine. Each screen gets its own `.css` file (or uses the existing one); CSS custom properties on `:root` in `index.css` serve as the single source of design tokens. `QuestionCard` gains two new props (`currentIndex`, `totalQuestions`) to render the progress rail.

**Tech Stack:** React 19, TypeScript, Vite, Vitest + React Testing Library, pure CSS, Google Fonts (DM Serif Display, DM Sans)

**Spec deviation:** Spec shows question numbers as `Q02` (zero-padded). Existing tests assert `Q1` (no padding). Plan keeps no zero-padding to avoid breaking tests; revisit separately if desired.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `agent-classroom/index.html` | Google Fonts preconnect + stylesheet links |
| Modify | `src/index.css` | Reading Room `:root` tokens + grain texture |
| Modify | `src/App.css` | Global background + idle screen class styles |
| Modify | `src/App.tsx` | Add class names to idle screen JSX; pass `currentIndex` + `totalQuestions` to `QuestionCard` |
| Create | `src/App.test.tsx` | Idle screen smoke tests |
| Rewrite | `src/components/QuestionCard.css` | Full Reading Room quiz screen styles |
| Modify | `src/components/QuestionCard.tsx` | Accept progress props; render progress section |
| Modify | `src/components/QuestionCard.test.tsx` | Add progress rail tests |
| Create | `src/components/ResultsScreen.css` | Reading Room results screen styles |
| Modify | `src/components/ResultsScreen.tsx` | Convert inline styles → class names |
| Modify | `src/components/ResultsScreen.test.tsx` | Add `.results-screen` + `.results-score-hero` smoke tests |
| Create | `src/components/ReviewGrid.css` | Reading Room review grid styles |
| Modify | `src/components/ReviewGrid.tsx` | Convert inline styles → class names; "Review" heading; "← Results" back link |
| Modify | `src/components/ReviewGrid.test.tsx` | Update heading text + back-button name |
| Create | `src/components/ExplanationScreen.css` | Reading Room explanation screen styles |
| Modify | `src/components/ExplanationScreen.tsx` | Convert inline styles → class names; add subject meta to header |
| Modify | `src/components/ExplanationScreen.test.tsx` | Update subject-heading test + back-button name |

---

## Task 1: Design System Foundation

**Files:**
- Modify: `agent-classroom/index.html`
- Modify: `agent-classroom/src/index.css`
- Modify: `agent-classroom/src/App.css`

No JS tests — pure CSS/HTML. Verified by a clean build.

- [ ] **Step 1: Add Google Fonts to `index.html`**

Replace the entire `<head>` block with:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>agent-classroom</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
</head>
```

- [ ] **Step 2: Replace `index.css` `:root` with Reading Room tokens**

Replace the entire contents of `src/index.css` with:

```css
:root {
  --bg: #f5f0e8;
  --ink: #1a1714;
  --terracotta: #c96842;
  --text-secondary: #4a4541;
  --text-muted: #9a8e82;
  --border: #e2d9ce;
  --surface: #faf7f2;
  --correct: #2d6a4f;
  --correct-bg: #edf7f2;
  --wrong: #9b2226;
  --wrong-bg: #fdf0f0;
  --skipped-bg: #f2f0ed;
  --skipped-border: #ddd8d0;

  --display: 'DM Serif Display', Georgia, serif;
  --sans: 'DM Sans', system-ui, sans-serif;

  font: 14px/1.5 var(--sans);
  color: var(--ink);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  z-index: 9999;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 128px 128px;
}
```

- [ ] **Step 3: Update `App.css` global background**

Replace the entire contents of `src/App.css` with:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  background: var(--bg);
}
```

- [ ] **Step 4: Verify build passes**

Run: `cd agent-classroom && npm run build`  
Expected: exits 0, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add agent-classroom/index.html agent-classroom/src/index.css agent-classroom/src/App.css
git commit -m "feat: add Reading Room design tokens, Google Fonts, grain texture"
```

---

## Task 2: Idle Screen Redesign

**Files:**
- Modify: `agent-classroom/src/App.css` (append idle screen rules)
- Modify: `agent-classroom/src/App.tsx` (add class names; new chip + meta + hint markup)
- Create: `agent-classroom/src/App.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/App.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('Idle Screen', () => {
  it('renders with idle-screen class', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.idle-screen')).toBeInTheDocument()
  })

  it('renders the subject chip', () => {
    render(<App />)
    expect(screen.getByTestId('idle-chip')).toBeInTheDocument()
  })

  it('renders the Start Revision CTA with idle-cta class', () => {
    const { container } = render(<App />)
    const btn = container.querySelector('.idle-cta')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Start Revision')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd agent-classroom && npm test -- App.test`  
Expected: FAIL — `.idle-screen` not found, `idle-chip` not found

- [ ] **Step 3: Append idle screen styles to `App.css`**

Append to `src/App.css` (after the existing global rules):

```css
/* Idle Screen */
.idle-screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 32px 22px 28px;
  box-sizing: border-box;
  background: var(--bg);
  max-width: 390px;
  margin: 0 auto;
  width: 100%;
}

.idle-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #e2c4b5;
  border-radius: 20px;
  padding: 4px 12px;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--terracotta);
  width: fit-content;
  margin-bottom: 16px;
}

.idle-chip::before {
  content: '●';
  font-size: 8px;
}

.idle-headline {
  font-family: var(--display);
  font-size: 30px;
  line-height: 1.2;
  color: var(--ink);
  margin-bottom: 12px;
}

.idle-headline em {
  font-style: italic;
}

.idle-sub {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}

.idle-meta {
  font-family: var(--sans);
  font-size: 10px;
  color: var(--text-muted);
  display: flex;
  gap: 12px;
}

.idle-spacer {
  flex: 1;
}

.idle-cta {
  width: 100%;
  background: var(--terracotta);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  padding: 13px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 10px;
}

.idle-hint {
  font-family: var(--sans);
  font-size: 10px;
  color: var(--text-muted);
  text-align: center;
}
```

- [ ] **Step 4: Replace the idle screen JSX in `App.tsx`**

Replace the `if (feed.status === 'idle')` block:

```tsx
if (feed.status === 'idle') {
  return (
    <div className="idle-screen">
      <span className="idle-chip" data-testid="idle-chip">Mathematics</span>
      <h1 className="idle-headline">
        Your next<br />
        <em>revision</em><br />
        session.
      </h1>
      <p className="idle-sub">
        17 questions, randomised order. Swipe right to skip, left to go back.
      </p>
      <div className="idle-meta">
        <span>📚 17 questions</span>
        <span>⏱ ~8 min</span>
      </div>
      <div className="idle-spacer" />
      <button className="idle-cta" onClick={() => feed.startSession()}>
        Start Revision
      </button>
      <p className="idle-hint">Swipe up anytime to pause</p>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd agent-classroom && npm test -- App.test`  
Expected: 3 tests PASS

- [ ] **Step 6: Commit**

```bash
git add agent-classroom/src/App.css agent-classroom/src/App.tsx agent-classroom/src/App.test.tsx
git commit -m "feat: redesign idle screen with Reading Room aesthetic"
```

---

## Task 3: Question Card Redesign

**Files:**
- Modify: `agent-classroom/src/components/QuestionCard.tsx`
- Rewrite: `agent-classroom/src/components/QuestionCard.css`
- Modify: `agent-classroom/src/App.tsx`
- Modify: `agent-classroom/src/components/QuestionCard.test.tsx`

- [ ] **Step 1: Write failing tests for progress rail**

Add inside `describe('QuestionCard')` in `QuestionCard.test.tsx`:

```tsx
describe('progress rail', () => {
  it('renders a progress rail element', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        onAdvance={vi.fn()}
        currentIndex={2}
        totalQuestions={17}
      />
    )
    expect(screen.getByTestId('progress-rail')).toBeInTheDocument()
  })

  it('sets progress fill width proportional to currentIndex/totalQuestions', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        onAdvance={vi.fn()}
        currentIndex={4}
        totalQuestions={17}
      />
    )
    const rail = screen.getByTestId('progress-rail')
    // Width is set as an inline style percentage — verify it contains a %
    expect(rail.style.width).toMatch(/%$/)
    expect(parseFloat(rail.style.width)).toBeCloseTo((4 / 17) * 100, 0)
  })

  it('renders subject and n/total meta', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        onAdvance={vi.fn()}
        currentIndex={5}
        totalQuestions={17}
      />
    )
    const meta = screen.getByTestId('progress-meta')
    expect(meta).toHaveTextContent('Mathematics')
    expect(meta).toHaveTextContent('6 / 17')
  })
})
```

Existing tests do not pass `currentIndex`/`totalQuestions`. TypeScript will error once the props are required. Update the three existing `render(...)` calls in the file to include the new props:

```tsx
// Replace every existing:
render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
// With:
render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} />)
```

(There are 6 such calls — update all of them.)

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd agent-classroom && npm test -- QuestionCard.test`  
Expected: FAIL — `progress-rail` not found; TypeScript compile errors on missing props

- [ ] **Step 3: Rewrite `QuestionCard.tsx` with progress props**

Replace the entire file:

```tsx
import { useEffect, useRef, useState } from 'react'
import type { Question } from '../questionBank/questionBank'
import './QuestionCard.css'

interface Props {
  question: Question
  onAnswer: (selected: string) => void
  onAdvance: () => void
  currentIndex: number
  totalQuestions: number
}

export function QuestionCard({ question, onAnswer, onAdvance, currentIndex, totalQuestions }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const [selected, setSelected] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelected(null)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [question.id])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  function handleOptionClick(label: string) {
    if (selected !== null) return
    setSelected(label)
    onAnswer(label)
    timerRef.current = setTimeout(() => {
      onAdvance()
    }, 1500)
  }

  const progressPct = totalQuestions > 0 ? (currentIndex / totalQuestions) * 100 : 0

  return (
    <div className="question-card">
      <div className="question-progress">
        <div className="question-progress-meta" data-testid="progress-meta">
          <span>{question.subject}</span>
          <span>{currentIndex + 1} / {totalQuestions}</span>
        </div>
        <div className="question-progress-track">
          <div
            className="question-progress-fill"
            data-testid="progress-rail"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
      <p className="question-text">{question.question}</p>
      <div className="options">
        {labels.map((label) => (
          <button
            key={label}
            className="option-btn"
            type="button"
            disabled={selected !== null}
            data-state={selected === label ? 'selected' : undefined}
            onClick={() => handleOptionClick(label)}
          >
            <span className="option-label">{label}</span>
            <span className="option-text">{question.options[label]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rewrite `QuestionCard.css`**

Replace the entire file:

```css
.question-card {
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;
  background: var(--bg);
  overflow-x: hidden;
}

/* Progress section */
.question-progress {
  padding: 16px 20px 0;
}

.question-progress-meta {
  display: flex;
  justify-content: space-between;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.question-progress-track {
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  margin-bottom: 18px;
  overflow: hidden;
}

.question-progress-fill {
  height: 100%;
  background: var(--terracotta);
  border-radius: 1px;
  transition: width 300ms ease;
}

/* Question text */
.question-text {
  font-family: var(--display);
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink);
  padding: 0 20px 18px;
  margin: 0;
}

/* Options */
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 20px 20px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  cursor: default;
  box-sizing: border-box;
  text-align: left;
}

.option-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  color: var(--terracotta);
}

.option-text {
  flex: 1;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}

.option-btn[data-state="selected"] {
  border-color: var(--terracotta);
  background: #fdf5f1;
}

.option-btn[data-state="selected"] .option-label {
  background: var(--terracotta);
  border-color: var(--terracotta);
  color: #fff;
}

.option-btn[data-state="selected"] .option-text {
  color: var(--ink);
}

.option-btn:disabled {
  opacity: 0.5;
}

.option-btn:disabled[data-state="selected"] {
  opacity: 1;
}
```

- [ ] **Step 5: Update `App.tsx` to pass progress props to `QuestionCard`**

Find the `<QuestionCard ...>` element in `App.tsx` and add the two new props:

```tsx
<QuestionCard
  question={feed.currentQuestion}
  onAnswer={feed.submitAnswer}
  onAdvance={feed.advance}
  currentIndex={feed.currentIndex}
  totalQuestions={feed.questions.length}
/>
```

- [ ] **Step 6: Run all tests**

Run: `cd agent-classroom && npm test`  
Expected: All tests pass, including 3 new progress rail tests

- [ ] **Step 7: Commit**

```bash
git add agent-classroom/src/components/QuestionCard.tsx agent-classroom/src/components/QuestionCard.css agent-classroom/src/components/QuestionCard.test.tsx agent-classroom/src/App.tsx
git commit -m "feat: redesign question card with progress rail and Reading Room aesthetic"
```

---

## Task 4: Results Screen Redesign

**Files:**
- Create: `agent-classroom/src/components/ResultsScreen.css`
- Modify: `agent-classroom/src/components/ResultsScreen.tsx`
- Modify: `agent-classroom/src/components/ResultsScreen.test.tsx`

- [ ] **Step 1: Write failing tests for new class names**

Add at the bottom of the `describe('ResultsScreen')` block in `ResultsScreen.test.tsx`:

```tsx
it('renders with results-screen class', () => {
  const { container } = render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()} />)
  expect(container.querySelector('.results-screen')).toBeInTheDocument()
})

it('renders the score hero element', () => {
  const { container } = render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()} />)
  expect(container.querySelector('.results-score-hero')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `cd agent-classroom && npm test -- ResultsScreen.test`  
Expected: last 2 tests FAIL — `.results-screen` and `.results-score-hero` not found

- [ ] **Step 3: Create `ResultsScreen.css`**

Create `src/components/ResultsScreen.css`:

```css
.results-screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 28px 22px 24px;
  box-sizing: border-box;
  background: var(--bg);
  max-width: 390px;
  margin: 0 auto;
  width: 100%;
  text-align: center;
}

.results-eyebrow {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--terracotta);
  margin-bottom: 6px;
}

.results-score-hero {
  font-family: var(--display);
  font-size: 88px;
  line-height: 1;
  color: var(--ink);
}

.results-score-denom {
  font-family: var(--sans);
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.results-score-sub {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.results-rule {
  width: 32px;
  height: 1.5px;
  background: var(--border);
  margin: 0 auto 16px;
  border: none;
}

.results-stats {
  display: flex;
  margin-bottom: 24px;
}

.results-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.results-stat + .results-stat {
  border-left: 1px solid var(--border);
}

.results-stat-number {
  font-family: var(--display);
  font-size: 20px;
  line-height: 1;
}

.results-stat-number--correct { color: var(--correct); }
.results-stat-number--wrong   { color: var(--wrong); }
.results-stat-number--skipped { color: var(--text-muted); }

.results-stat-label {
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.results-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.results-btn-primary {
  width: 100%;
  padding: 11px;
  border-radius: 6px;
  border: none;
  background: var(--ink);
  color: var(--bg);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}

.results-btn-ghost {
  width: 100%;
  padding: 11px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  background: none;
  color: var(--text-muted);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}
```

- [ ] **Step 4: Rewrite `ResultsScreen.tsx` to use class names**

Replace the entire file:

```tsx
import type { SessionSummary } from '../questionFeed/useQuestionFeed'
import './ResultsScreen.css'

interface Props {
  summary: SessionSummary
  onStartAgain: () => void
  onDone?: () => void
  onReviewQuestions?: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function ResultsScreen({ summary, onStartAgain, onReviewQuestions }: Props) {
  return (
    <div className="results-screen">
      <p className="results-eyebrow">Session Complete</p>
      <div className="results-score-hero">{summary.correct}</div>
      <p className="results-score-denom">out of {summary.totalAttempted}</p>
      <p className="results-score-sub" data-testid="stat-duration">
        correct answers · {formatDuration(summary.durationSeconds)}
      </p>
      <hr className="results-rule" />

      <div className="results-stats">
        <div className="results-stat" data-testid="stat-correct">
          <span className="results-stat-number results-stat-number--correct">{summary.correct}</span>
          <span className="results-stat-label">Correct</span>
        </div>
        <div className="results-stat" data-testid="stat-wrong">
          <span className="results-stat-number results-stat-number--wrong">{summary.wrong}</span>
          <span className="results-stat-label">Wrong</span>
        </div>
        <div className="results-stat" data-testid="stat-skipped">
          <span className="results-stat-number results-stat-number--skipped">{summary.skipped}</span>
          <span className="results-stat-label">Skipped</span>
        </div>
      </div>

      <div className="results-actions">
        {onReviewQuestions && (
          <button className="results-btn-primary" onClick={onReviewQuestions}>
            Review Questions
          </button>
        )}
        <button className="results-btn-ghost" onClick={onStartAgain}>
          Start Again
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run all tests**

Run: `cd agent-classroom && npm test -- ResultsScreen.test`  
Expected: All 8 tests PASS (existing + 2 new)

- [ ] **Step 6: Commit**

```bash
git add agent-classroom/src/components/ResultsScreen.css agent-classroom/src/components/ResultsScreen.tsx agent-classroom/src/components/ResultsScreen.test.tsx
git commit -m "feat: redesign results screen with Reading Room aesthetic"
```

---

## Task 5: Review Grid Redesign

**Files:**
- Create: `agent-classroom/src/components/ReviewGrid.css`
- Modify: `agent-classroom/src/components/ReviewGrid.tsx`
- Modify: `agent-classroom/src/components/ReviewGrid.test.tsx`

**Spec changes that affect tests:**
- Heading changes from "Review Questions" → "Review"
- Back button label changes from "← Back" → "← Results" (test uses `/back/i` — update to `/results/i`)
- Filter label "Incorrect" → "Wrong" (tests use `data-testid`, not label text — safe)

- [ ] **Step 1: Write failing tests for new class names and update stale assertions**

In `ReviewGrid.test.tsx`:

1. Change the heading assertion:
```tsx
// OLD:
expect(screen.getByText('Review Questions')).toBeInTheDocument()
// NEW:
expect(screen.getByText('Review')).toBeInTheDocument()
```

2. Change both back-button assertions (2 occurrences):
```tsx
// OLD:
screen.getByRole('button', { name: /back/i })
// NEW:
screen.getByRole('button', { name: /results/i })
```

3. Add at the bottom of `describe('ReviewGrid')`:
```tsx
it('renders with review-grid class', () => {
  const { container } = render(
    <ReviewGrid session={session} questions={questions} onBack={vi.fn()} onOpenExplanation={vi.fn()} />
  )
  expect(container.querySelector('.review-grid')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm the updated assertions fail**

Run: `cd agent-classroom && npm test -- ReviewGrid.test`  
Expected: FAIL — "Review" not found (component still says "Review Questions"), back button assertion fails

- [ ] **Step 3: Create `ReviewGrid.css`**

Create `src/components/ReviewGrid.css`:

```css
.review-grid {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg);
  box-sizing: border-box;
  max-width: 390px;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.review-grid-header {
  padding: 18px 18px 0;
}

.review-grid-back {
  display: inline-block;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 6px;
}

.review-grid-heading {
  font-family: var(--display);
  font-size: 20px;
  color: var(--ink);
  margin-bottom: 10px;
}

/* Filter bar */
.review-grid-filters {
  display: flex;
  gap: 6px;
  padding: 0 18px 10px;
  overflow-x: auto;
}

.review-filter-pill {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: none;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.review-filter-pill[data-active="true"] {
  border-color: var(--ink);
  color: var(--ink);
}

/* Grid */
.review-grid-tiles {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 18px 14px;
  align-content: start;
  flex: 1;
}

/* Tile */
.review-tile {
  border-radius: 8px;
  padding: 10px 12px;
  border: 1.5px solid;
  cursor: pointer;
  text-align: left;
  background: none;
}

.review-tile--correct {
  background: var(--correct-bg);
  border-color: #b8deca;
}

.review-tile--wrong {
  background: var(--wrong-bg);
  border-color: #e8b4b4;
}

.review-tile--skipped {
  background: var(--skipped-bg);
  border-color: var(--skipped-border);
}

.review-tile-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.review-tile-number {
  font-family: var(--display);
  font-size: 18px;
  line-height: 1;
}

.review-tile--correct .review-tile-number { color: var(--correct); }
.review-tile--wrong   .review-tile-number { color: var(--wrong); }
.review-tile--skipped .review-tile-number { color: var(--text-muted); }

.review-tile-icon {
  font-size: 11px;
  font-weight: 700;
}

.review-tile--correct .review-tile-icon { color: var(--correct); }
.review-tile--wrong   .review-tile-icon { color: var(--wrong); }
.review-tile--skipped .review-tile-icon { color: #b5a99e; }

.review-tile-preview {
  font-family: var(--sans);
  font-size: 10px;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.review-tile-label {
  display: none; /* visible to tests via text content; hidden from UI */
}

/* Pagination */
.review-grid-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 18px 16px;
}

.review-pagination-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1.5px solid var(--border);
  background: none;
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink);
  cursor: pointer;
}

.review-pagination-btn:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.review-pagination-info {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-muted);
  min-width: 50px;
  text-align: center;
}
```

- [ ] **Step 4: Rewrite `ReviewGrid.tsx` to use class names**

Replace the entire file:

```tsx
import { useState } from 'react'
import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'
import './ReviewGrid.css'

interface Props {
  session: SessionRecord[]
  questions: Question[]
  onBack: () => void
  onOpenExplanation: (questionId: string) => void
}

type Outcome = 'correct' | 'wrong' | 'skipped'
type Filter = 'all' | Outcome

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'correct', label: 'Correct' },
  { value: 'wrong',   label: 'Wrong' },
  { value: 'skipped', label: 'Skipped' },
]

const tileClass: Record<Outcome, string> = {
  correct: 'review-tile review-tile--correct',
  wrong:   'review-tile review-tile--wrong',
  skipped: 'review-tile review-tile--skipped',
}

const outcomeIcon: Record<Outcome, string> = {
  correct: '✓',
  wrong:   '✕',
  skipped: '–',
}

const outcomeLabel: Record<Outcome, string> = {
  correct: 'Correct',
  wrong:   'Wrong',
  skipped: 'Skipped',
}

function computeOutcome(selectedOption: string, question: Question): Outcome {
  if (selectedOption === 'skipped') return 'skipped'
  return selectedOption === question.correctOption ? 'correct' : 'wrong'
}

function questionNumber(id: string): string {
  const n = parseInt(id.replace(/\D/g, ''), 10)
  return `Q${isNaN(n) ? id : n}`
}

const TILES_PER_PAGE = 6

export function ReviewGrid({ session, questions, onBack, onOpenExplanation }: Props) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const recordMap = new Map(session.map((r) => [r.questionId, r]))
  const allTiles = Array.from(recordMap.values())

  const tiles = filter === 'all'
    ? allTiles
    : allTiles.filter((r) => {
        const q = questionMap.get(r.questionId)
        return q && computeOutcome(r.selectedOption, q) === filter
      })

  const totalPages = Math.max(1, Math.ceil(tiles.length / TILES_PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)
  const pageTiles = tiles.slice(safePage * TILES_PER_PAGE, (safePage + 1) * TILES_PER_PAGE)

  function applyFilter(f: Filter) {
    setFilter(f)
    setPage(0)
  }

  return (
    <div className="review-grid">
      <div className="review-grid-header">
        <button className="review-grid-back" onClick={onBack}>← Results</button>
        <h2 className="review-grid-heading">Review</h2>
      </div>

      <div className="review-grid-filters">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className="review-filter-pill"
            data-testid={`filter-${value}`}
            data-active={filter === value ? 'true' : undefined}
            onClick={() => applyFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="review-grid-tiles">
        {pageTiles.map((record) => {
          const question = questionMap.get(record.questionId)
          if (!question) return null
          const outcome = computeOutcome(record.selectedOption, question)
          return (
            <button
              key={record.questionId}
              className={tileClass[outcome]}
              data-testid={`result-tile-${record.questionId}`}
              onClick={() => onOpenExplanation(record.questionId)}
            >
              <div className="review-tile-top">
                <span className="review-tile-number">{questionNumber(record.questionId)}</span>
                <span className="review-tile-icon">{outcomeIcon[outcome]}</span>
              </div>
              <p className="review-tile-preview">{question.question}</p>
              <span className="review-tile-label">{outcomeLabel[outcome]}</span>
            </button>
          )
        })}
      </div>

      <div className="review-grid-pagination">
        <button
          className="review-pagination-btn"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={safePage === 0}
        >
          ←
        </button>
        <span className="review-pagination-info">
          {safePage + 1} / {totalPages}
        </span>
        <button
          className="review-pagination-btn"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={safePage === totalPages - 1}
        >
          →
        </button>
      </div>
    </div>
  )
}
```

**Note on the tile label:** The tests assert `.toHaveTextContent('Correct')`, `.toHaveTextContent('Wrong')`, `.toHaveTextContent('Skipped')` on each tile. The `review-tile-label` span carries that text and is `display: none` visually (the icon serves the visual role), but remains in the DOM for test assertions. The `review-tile-preview` also adds question text to the tile's text content.

- [ ] **Step 5: Run all tests**

Run: `cd agent-classroom && npm test -- ReviewGrid.test`  
Expected: All tests PASS (including the new `.review-grid` smoke test)

- [ ] **Step 6: Commit**

```bash
git add agent-classroom/src/components/ReviewGrid.css agent-classroom/src/components/ReviewGrid.tsx agent-classroom/src/components/ReviewGrid.test.tsx
git commit -m "feat: redesign review grid with Reading Room aesthetic"
```

---

## Task 6: Explanation Screen Redesign

**Files:**
- Create: `agent-classroom/src/components/ExplanationScreen.css`
- Modify: `agent-classroom/src/components/ExplanationScreen.tsx`
- Modify: `agent-classroom/src/components/ExplanationScreen.test.tsx`

**Spec changes that affect tests:**
- Header now shows subject meta (`Mathematics · Q1`). The test `it('does not render the subject heading')` must be replaced with a test that asserts the meta IS rendered.
- Back button changes from "← Back" → "← Review". Test uses `/back/i` — update to `/review/i`.

- [ ] **Step 1: Update stale tests and add class name test**

In `ExplanationScreen.test.tsx`:

1. Replace the "does not render the subject heading" test:
```tsx
// OLD:
it('does not render the subject heading', () => {
  render(...)
  expect(screen.queryByText('Mathematics')).not.toBeInTheDocument()
})
// NEW:
it('renders subject and question number in the header meta', () => {
  render(
    <ExplanationScreen
      question={question}
      explanation={explanation}
      selectedOption="A"
      onBack={vi.fn()}
    />,
  )
  expect(screen.getByTestId('explanation-meta')).toHaveTextContent('Mathematics')
  expect(screen.getByTestId('explanation-meta')).toHaveTextContent('Q1')
})
```

2. Update the back-button assertion:
```tsx
// OLD:
fireEvent.click(screen.getByRole('button', { name: /back/i }))
// NEW:
fireEvent.click(screen.getByRole('button', { name: /review/i }))
```

3. Add at the bottom of `describe('ExplanationScreen')`:
```tsx
it('renders with explanation-screen class', () => {
  const { container } = render(
    <ExplanationScreen question={question} explanation={explanation} selectedOption="A" onBack={vi.fn()} />
  )
  expect(container.querySelector('.explanation-screen')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to confirm updated assertions fail**

Run: `cd agent-classroom && npm test -- ExplanationScreen.test`  
Expected: subject-heading test FAIL (meta not rendered yet), back-button test FAIL ("← Review" not found)

- [ ] **Step 3: Create `ExplanationScreen.css`**

Create `src/components/ExplanationScreen.css`:

```css
.explanation-screen {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--bg);
  box-sizing: border-box;
  max-width: 390px;
  margin: 0 auto;
  width: 100%;
}

/* Header */
.explanation-header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
}

.explanation-back {
  display: inline-block;
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-bottom: 4px;
}

.explanation-meta {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--terracotta);
  margin-bottom: 6px;
}

.explanation-question {
  font-family: var(--display);
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink);
  margin: 0;
}

/* Options */
.explanation-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--border);
}

.explanation-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  overflow: hidden;
}

.explanation-option[data-state="correct"] {
  border-color: var(--correct);
  background: var(--correct-bg);
  color: var(--correct);
}

.explanation-option[data-state="wrong"] {
  border-color: var(--wrong);
  background: var(--wrong-bg);
  color: var(--wrong);
}

.explanation-option-label {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  min-width: 12px;
}

.explanation-option-text {
  flex: 1;
  font-family: var(--sans);
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
}

.explanation-option[data-state="correct"] .explanation-option-text,
.explanation-option[data-state="wrong"]   .explanation-option-text {
  color: inherit;
}

.explanation-option-tag {
  font-family: var(--sans);
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: auto;
  align-self: center;
  white-space: nowrap;
}

/* Step cards */
.explanation-steps {
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.explanation-steps-label {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--terracotta);
  margin-bottom: 2px;
}

.explanation-step {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 7px;
  padding: 8px 10px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.explanation-step-number {
  font-family: var(--display);
  font-size: 16px;
  color: var(--border);
  line-height: 1;
  flex-shrink: 0;
}

.explanation-step-text {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}
```

- [ ] **Step 4: Rewrite `ExplanationScreen.tsx` to use class names**

Replace the entire file:

```tsx
import type { Question } from '../questionBank/questionBank'
import type { Explanation } from '../explanations/explanations'
import './ExplanationScreen.css'

interface Props {
  question: Question
  explanation: Explanation
  selectedOption: string
  onBack: () => void
}

function questionNumber(id: string): string {
  const n = parseInt(id.replace(/\D/g, ''), 10)
  return `Q${isNaN(n) ? id : n}`
}

export function ExplanationScreen({ question, explanation, selectedOption, onBack }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const answered = selectedOption !== 'skipped'

  function getState(label: string): 'correct' | 'wrong' | undefined {
    if (label === question.correctOption) return 'correct'
    if (label === selectedOption && answered) return 'wrong'
    return undefined
  }

  return (
    <div className="explanation-screen">
      <div className="explanation-header">
        <button className="explanation-back" onClick={onBack}>← Review</button>
        <p className="explanation-meta" data-testid="explanation-meta">
          {question.subject} · {questionNumber(question.id)}
        </p>
        <p className="explanation-question">{question.question}</p>
      </div>

      <div className="explanation-options">
        {labels.map((label) => {
          const state = getState(label)
          const isSelected = label === selectedOption && answered
          const isCorrect = label === question.correctOption

          return (
            <div
              key={label}
              className="explanation-option"
              data-testid={`option-${label}`}
              {...(state ? { 'data-state': state } : {})}
            >
              <span className="explanation-option-label">{label}.</span>
              <span className="explanation-option-text">{question.options[label]}</span>
              {isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-correct-${label}`}
                >
                  Correct answer
                </span>
              )}
              {isSelected && !isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-selected-${label}`}
                >
                  Your answer
                </span>
              )}
              {isSelected && isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-selected-${label}`}
                >
                  Your answer
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="explanation-steps">
        <p className="explanation-steps-label">Explanation</p>
        {explanation.steps.map((step, i) => (
          <div key={i} className="explanation-step">
            <span className="explanation-step-number">{i + 1}</span>
            <p className="explanation-step-text">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run all tests**

Run: `cd agent-classroom && npm test -- ExplanationScreen.test`  
Expected: All tests PASS (including updated + new tests)

- [ ] **Step 6: Commit**

```bash
git add agent-classroom/src/components/ExplanationScreen.css agent-classroom/src/components/ExplanationScreen.tsx agent-classroom/src/components/ExplanationScreen.test.tsx
git commit -m "feat: redesign explanation screen with Reading Room aesthetic"
```

---

## Task 7: Visual Smoke Test

**Purpose:** Type checking and unit tests verify structure, not appearance. This task verifies fonts load, grain is felt not seen, colours are correct, and no regressions in CompanionSheet or swipe gestures.

- [ ] **Step 1: Start the dev server**

Run: `cd agent-classroom && npm run dev`  
Navigate to `http://localhost:5173` in a browser.

- [ ] **Step 2: Walk the Idle Screen**

- Background is warm parchment (`#f5f0e8`) — not white, not dark
- "● Mathematics" chip renders in terracotta with pill border
- Headline uses DM Serif Display (serif, elegant)
- "Start Revision" button is terracotta
- Grain texture is detectable on a light monitor (very subtle — opacity 0.035)

- [ ] **Step 3: Walk the Question Screen**

- Click "Start Revision"
- Progress meta shows subject + question count
- Terracotta progress bar fills as questions advance
- Options use soft cream cards with terracotta letter badges
- Selecting an option highlights it in terracotta
- Auto-advance after 1.5 seconds

- [ ] **Step 4: Verify swipe + CompanionSheet**

- Swipe up (or drag up from bottom) opens CompanionSheet — visual polish only, still functional
- Pause / Resume / End Session commands work

- [ ] **Step 5: Walk the Results Screen**

- Reach end of session (use End Session from CompanionSheet if needed)
- Giant serif score number centred
- Three-column stats row with coloured numbers
- "Review Questions" and "Start Again" buttons render

- [ ] **Step 6: Walk the Review Grid**

- Click "Review Questions"
- Tiles use cream/green/red/grey tinted backgrounds
- "← Results" back link works
- Filter pills work (All / Correct / Wrong / Skipped)
- Click a tile → Explanation Screen opens

- [ ] **Step 7: Walk the Explanation Screen**

- Header shows "← Review", terracotta meta, serif question text
- All 4 option cards render; correct card is green-tinted
- Wrong pick (if any) is red-tinted with "Your answer" tag
- Step cards show explanation
- "← Review" returns to grid

- [ ] **Step 8: Final commit if any visual tweaks were needed**

```bash
git add -p   # stage only intentional tweaks
git commit -m "fix: visual polish after smoke test"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec section | Covered by task |
|---|---|
| Typography (DM Serif Display + DM Sans) | Task 1 (fonts), Tasks 2–6 (applied via CSS vars) |
| Colour palette tokens | Task 1 |
| Grain texture | Task 1 |
| Idle Screen layout | Task 2 |
| Question Card + progress rail | Task 3 |
| Results Screen hero layout | Task 4 |
| Review Grid with filter + pagination | Task 5 |
| Explanation Screen with step cards | Task 6 |
| Gestures / auto-advance unchanged | Not touched (preserved) |
| CompanionSheet unchanged (visual polish only) | Not touched (preserved — visual polish TBD in smoke test) |

**Deliberate spec deviations:**
- Question numbers: spec shows `Q02`; keeping `Q1` (no zero-padding) to preserve existing test assertions.
- `review-tile-label` is `display: none` in the CSS — the label text is in the DOM for test assertions but the icon serves the visual role per spec.
