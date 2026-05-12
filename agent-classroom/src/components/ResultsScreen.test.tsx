import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultsScreen } from './ResultsScreen'
import type { SessionSummary } from '../questionFeed/useQuestionFeed'

const baseSummary: SessionSummary = {
  correct: 5,
  wrong: 3,
  skipped: 2,
  totalAttempted: 10,
  durationSeconds: 222,
}

describe('ResultsScreen', () => {
  it('renders all five ledger rows: Correct, Wrong, Skipped, Score, and Time', () => {
    render(<ResultsScreen summary={baseSummary} onReview={vi.fn()} onAskSage={vi.fn()} />)
    expect(screen.getByTestId('ledger-row-correct')).toBeInTheDocument()
    expect(screen.getByTestId('ledger-row-wrong')).toBeInTheDocument()
    expect(screen.getByTestId('ledger-row-skipped')).toBeInTheDocument()
    expect(screen.getByTestId('ledger-row-score')).toBeInTheDocument()
    expect(screen.getByTestId('ledger-row-time')).toBeInTheDocument()
  })

  it('SageTrigger renders with showNav={false} — nav row absent from DOM', () => {
    render(<ResultsScreen summary={baseSummary} onReview={vi.fn()} onAskSage={vi.fn()} />)
    expect(screen.queryByTestId('nav-row')).not.toBeInTheDocument()
  })

  it('"Review answers →" click calls the onReview prop', () => {
    const onReview = vi.fn()
    render(<ResultsScreen summary={baseSummary} onReview={onReview} onAskSage={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /review answers/i }))
    expect(onReview).toHaveBeenCalledOnce()
  })
})
