import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReviewGrid } from './ReviewGrid'
import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'

const questions: Question[] = [
  {
    id: 'q001',
    subject: 'Math',
    question: 'Q1?',
    options: { A: 'A1', B: 'B1', C: 'C1', D: 'D1' },
    correctOption: 'A',
  },
  {
    id: 'q002',
    subject: 'Physics',
    question: 'Q2?',
    options: { A: 'A2', B: 'B2', C: 'C2', D: 'D2' },
    correctOption: 'B',
  },
  {
    id: 'q003',
    subject: 'Chemistry',
    question: 'Q3?',
    options: { A: 'A3', B: 'B3', C: 'C3', D: 'D3' },
    correctOption: 'C',
  },
]

const session: SessionRecord[] = [
  { questionId: 'q001', selectedOption: 'A' },       // correct
  { questionId: 'q002', selectedOption: 'A' },       // wrong (correct is B)
  { questionId: 'q003', selectedOption: 'skipped' }, // skipped
]

describe('ReviewGrid', () => {
  it('renders a heading "Review"', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('renders one seat per unique attended question', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-tile-q001')).toBeInTheDocument()
    expect(screen.getByTestId('result-tile-q002')).toBeInTheDocument()
    expect(screen.getByTestId('result-tile-q003')).toBeInTheDocument()
  })

  it('deduplicates: when a question appears twice in session, renders only one seat', () => {
    const dupSession: SessionRecord[] = [
      { questionId: 'q001', selectedOption: 'B' }, // first attempt — wrong
      { questionId: 'q001', selectedOption: 'A' }, // second attempt — correct (last wins)
    ]
    render(
      <ReviewGrid
        session={dupSession}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getAllByTestId(/^result-tile-/)).toHaveLength(1)
    expect(screen.getByTestId('result-tile-q001')).toBeInTheDocument()
  })

  it('correct seat has class seat--correct', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-tile-q001')).toHaveClass('seat--correct')
  })

  it('wrong seat has class seat--wrong', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-tile-q002')).toHaveClass('seat--wrong')
  })

  it('skipped seat has class seat--skipped', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('result-tile-q003')).toHaveClass('seat--skipped')
  })

  it('clicking a seat calls onOpenExplanation with the correct questionId', () => {
    const onOpenExplanation = vi.fn()
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={onOpenExplanation}
      />,
    )
    fireEvent.click(screen.getByTestId('result-tile-q002'))
    expect(onOpenExplanation).toHaveBeenCalledWith('q002')
  })

  it('renders a "Results" back button', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /results/i })).toBeInTheDocument()
  })

  it('clicking "Results" calls onBack', () => {
    const onBack = vi.fn()
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={onBack}
        onOpenExplanation={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /results/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders no seats when session is empty', () => {
    render(
      <ReviewGrid
        session={[]}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.queryAllByTestId(/^result-tile-/)).toHaveLength(0)
  })

  it('legend dots for correct, wrong, and skipped are in the DOM', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('legend-correct')).toBeInTheDocument()
    expect(screen.getByTestId('legend-wrong')).toBeInTheDocument()
    expect(screen.getByTestId('legend-skipped')).toBeInTheDocument()
  })

  it('SageTrigger renders with showNav={true} — nav row is present in DOM', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByTestId('nav-row')).toBeInTheDocument()
  })

  describe('filter', () => {
    it('renders ALL / WRONG / SKIPPED / CORRECT filter tabs', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      expect(screen.getByTestId('filter-all')).toBeInTheDocument()
      expect(screen.getByTestId('filter-correct')).toBeInTheDocument()
      expect(screen.getByTestId('filter-wrong')).toBeInTheDocument()
      expect(screen.getByTestId('filter-skipped')).toBeInTheDocument()
    })

    it('filtering by CORRECT shows only correct seats', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByTestId('filter-correct'))
      expect(screen.getByTestId('result-tile-q001')).toBeInTheDocument()
      expect(screen.queryByTestId('result-tile-q002')).not.toBeInTheDocument()
      expect(screen.queryByTestId('result-tile-q003')).not.toBeInTheDocument()
    })

    it('filtering by WRONG shows only wrong seats', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByTestId('filter-wrong'))
      expect(screen.queryByTestId('result-tile-q001')).not.toBeInTheDocument()
      expect(screen.getByTestId('result-tile-q002')).toBeInTheDocument()
      expect(screen.queryByTestId('result-tile-q003')).not.toBeInTheDocument()
    })

    it('filtering by WRONG leaves only circles with seat--wrong class', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByTestId('filter-wrong'))
      const seat = screen.getByTestId('result-tile-q002')
      expect(seat).toHaveClass('seat--wrong')
      expect(screen.queryByTestId('result-tile-q001')).not.toBeInTheDocument()
      expect(screen.queryByTestId('result-tile-q003')).not.toBeInTheDocument()
    })

    it('filtering by SKIPPED shows only skipped seats', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByTestId('filter-skipped'))
      expect(screen.queryByTestId('result-tile-q001')).not.toBeInTheDocument()
      expect(screen.queryByTestId('result-tile-q002')).not.toBeInTheDocument()
      expect(screen.getByTestId('result-tile-q003')).toBeInTheDocument()
    })

    it('switching back to ALL restores all seats', () => {
      render(
        <ReviewGrid
          session={session}
          questions={questions}
          onBack={vi.fn()}
          onOpenExplanation={vi.fn()}
        />,
      )
      fireEvent.click(screen.getByTestId('filter-correct'))
      fireEvent.click(screen.getByTestId('filter-all'))
      expect(screen.getByTestId('result-tile-q001')).toBeInTheDocument()
      expect(screen.getByTestId('result-tile-q002')).toBeInTheDocument()
      expect(screen.getByTestId('result-tile-q003')).toBeInTheDocument()
    })
  })

  it('renders with review-grid class', () => {
    const { container } = render(
      <ReviewGrid session={session} questions={questions} onBack={vi.fn()} onOpenExplanation={vi.fn()} />
    )
    expect(container.querySelector('.review-grid')).toBeInTheDocument()
  })
})
