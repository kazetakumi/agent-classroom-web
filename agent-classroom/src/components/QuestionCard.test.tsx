import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { Question } from '../questionBank/questionBank'

const mockQuestion: Question = {
  id: 'q001',
  subject: 'Mathematics',
  question: 'What is 2 + 2?',
  options: { A: '3', B: '4', C: '5', D: '6' },
  correctOption: 'B',
}

const sageTriggerProps = {
  onAskSage: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  canGoPrev: true,
  canGoNext: true,
}

describe('QuestionCard', () => {
  it('renders the question text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('renders four option letter labels A, B, C, D', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
  })

  it('renders each option text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('renders the subject label', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
    expect(screen.getByText('Mathematics')).toBeInTheDocument()
  })

  it('is scoped under .question-card CSS namespace', () => {
    const { container } = render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
    expect(container.querySelector('.question-card')).toBeInTheDocument()
  })

  describe('progress bar', () => {
    it('progress bar in SageTrigger reflects currentIndex/totalQuestions', () => {
      render(
        <QuestionCard
          question={mockQuestion}
          onAnswer={vi.fn()}
          onAdvance={vi.fn()}
          currentIndex={4}
          totalQuestions={17}
          {...sageTriggerProps}
        />
      )
      const bar = screen.getByTestId('progress-bar')
      expect(bar.style.width).toMatch(/%$/)
      expect(parseFloat(bar.style.width)).toBeCloseTo((4 / 17) * 100, 0)
    })
  })

  describe('interaction', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('tapping an option puts that button into a data-state="selected" state', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(screen.getByRole('button', { name: /^A/ })).toHaveAttribute('data-state', 'selected')
    })

    it('no other option changes to selected state when one is tapped', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(screen.getByRole('button', { name: /^B/ })).not.toHaveAttribute('data-state', 'selected')
      expect(screen.getByRole('button', { name: /^C/ })).not.toHaveAttribute('data-state', 'selected')
      expect(screen.getByRole('button', { name: /^D/ })).not.toHaveAttribute('data-state', 'selected')
    })

    it('unselected siblings drop to opacity: 0.3 after a selection', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(screen.getByRole('button', { name: /^B/ }).style.opacity).toBe('0.3')
      expect(screen.getByRole('button', { name: /^C/ }).style.opacity).toBe('0.3')
      expect(screen.getByRole('button', { name: /^D/ }).style.opacity).toBe('0.3')
    })

    it('onAdvance is called after ~1.5s following a tap', () => {
      const onAdvance = vi.fn()
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={onAdvance} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(onAdvance).not.toHaveBeenCalled()
      act(() => { vi.advanceTimersByTime(1500) })
      expect(onAdvance).toHaveBeenCalledOnce()
    })
  })

  describe('SageTrigger', () => {
    it('renders SageTrigger sage-strip', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      expect(screen.getByTestId('sage-strip')).toBeInTheDocument()
    })

    it('renders SageTrigger with showNav={true} — nav-row is present', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} currentIndex={0} totalQuestions={17} {...sageTriggerProps} />)
      expect(screen.getByTestId('nav-row')).toBeInTheDocument()
    })
  })
})
