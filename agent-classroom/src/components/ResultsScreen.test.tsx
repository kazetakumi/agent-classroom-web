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
  it('renders correct count from summary prop', () => {
    render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()}/>)
    expect(screen.getByTestId('stat-correct')).toHaveTextContent('5')
  })

  it('renders wrong count from summary prop', () => {
    render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()}/>)
    expect(screen.getByTestId('stat-wrong')).toHaveTextContent('3')
  })

  it('renders skipped count from summary prop', () => {
    render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()}/>)
    expect(screen.getByTestId('stat-skipped')).toHaveTextContent('2')
  })

  it('renders formatted duration from summary prop', () => {
    render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()}/>)
    // 222 seconds = 3m 42s
    expect(screen.getByTestId('stat-duration')).toHaveTextContent('3m 42s')
  })

  it('calls onStartAgain when "Start Again" button is pressed', () => {
    const onStartAgain = vi.fn()
    render(<ResultsScreen summary={baseSummary} onStartAgain={onStartAgain}/>)
    fireEvent.click(screen.getByRole('button', { name: 'Start Again' }))
    expect(onStartAgain).toHaveBeenCalledOnce()
  })

  it('renders a "Review Questions" button when onReviewQuestions is provided', () => {
    render(
      <ResultsScreen
        summary={baseSummary}
        onStartAgain={vi.fn()}
        onDone={vi.fn()}
        onReviewQuestions={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Review Questions' })).toBeInTheDocument()
  })

  it('calls onReviewQuestions when "Review Questions" button is pressed', () => {
    const onReviewQuestions = vi.fn()
    render(
      <ResultsScreen
        summary={baseSummary}
        onStartAgain={vi.fn()}
        onDone={vi.fn()}
        onReviewQuestions={onReviewQuestions}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Review Questions' }))
    expect(onReviewQuestions).toHaveBeenCalledOnce()
  })

  it('renders with results-screen class', () => {
    const { container } = render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()} />)
    expect(container.querySelector('.results-screen')).toBeInTheDocument()
  })

  it('renders the score hero element', () => {
    const { container } = render(<ResultsScreen summary={baseSummary} onStartAgain={vi.fn()} />)
    expect(container.querySelector('.results-score-hero')).toBeInTheDocument()
  })
})
