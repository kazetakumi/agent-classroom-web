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
  { questionId: 'q001', selectedOption: 'A' },    // correct
  { questionId: 'q002', selectedOption: 'A' },    // wrong (correct is B)
  { questionId: 'q003', selectedOption: 'skipped' }, // skipped
]

describe('ReviewGrid', () => {
  it('renders a heading "Review Questions"', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByText('Review Questions')).toBeInTheDocument()
  })

  it('renders one tile per unique attended question', () => {
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

  it('deduplicates: when a question appears twice in session, renders only one tile', () => {
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

  it('correct tile displays question number and "Correct" label', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    const tile = screen.getByTestId('result-tile-q001')
    expect(tile).toHaveTextContent('Q1')
    expect(tile).toHaveTextContent('Correct')
  })

  it('wrong tile displays question number and "Wrong" label', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    const tile = screen.getByTestId('result-tile-q002')
    expect(tile).toHaveTextContent('Q2')
    expect(tile).toHaveTextContent('Wrong')
  })

  it('skipped tile displays question number and "Skipped" label', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    const tile = screen.getByTestId('result-tile-q003')
    expect(tile).toHaveTextContent('Q3')
    expect(tile).toHaveTextContent('Skipped')
  })

  it('clicking a tile calls onOpenExplanation with the correct questionId', () => {
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

  it('renders a "Back" button', () => {
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={vi.fn()}
        onOpenExplanation={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('clicking "Back" calls onBack', () => {
    const onBack = vi.fn()
    render(
      <ReviewGrid
        session={session}
        questions={questions}
        onBack={onBack}
        onOpenExplanation={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders no tiles when session is empty', () => {
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

  describe('filter', () => {
    it('renders All / Correct / Incorrect / Skipped filter buttons', () => {
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

    it('filtering by Correct shows only correct tiles', () => {
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

    it('filtering by Incorrect shows only wrong tiles', () => {
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

    it('filtering by Skipped shows only skipped tiles', () => {
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

    it('switching back to All restores all tiles', () => {
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
})
