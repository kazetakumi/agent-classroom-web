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

describe('QuestionCard', () => {
  it('renders the question text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('renders four option buttons labelled A, B, C, D', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
    expect(screen.getByText(/^A\b/)).toBeInTheDocument()
    expect(screen.getByText(/^B\b/)).toBeInTheDocument()
    expect(screen.getByText(/^C\b/)).toBeInTheDocument()
    expect(screen.getByText(/^D\b/)).toBeInTheDocument()
  })

  it('renders each option text', () => {
    render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/4/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
    expect(screen.getByText(/6/)).toBeInTheDocument()
  })

  describe('interaction', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('tapping an option puts that button into a data-state="selected" state', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(screen.getByRole('button', { name: /^A/ })).toHaveAttribute('data-state', 'selected')
    })

    it('no other option changes to selected state when one is tapped', () => {
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={vi.fn()} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(screen.getByRole('button', { name: /^B/ })).not.toHaveAttribute('data-state', 'selected')
      expect(screen.getByRole('button', { name: /^C/ })).not.toHaveAttribute('data-state', 'selected')
      expect(screen.getByRole('button', { name: /^D/ })).not.toHaveAttribute('data-state', 'selected')
    })

    it('onAdvance is called after ~1.5s following a tap', () => {
      const onAdvance = vi.fn()
      render(<QuestionCard question={mockQuestion} onAnswer={vi.fn()} onAdvance={onAdvance} />)
      fireEvent.click(screen.getByRole('button', { name: /^A/ }))
      expect(onAdvance).not.toHaveBeenCalled()
      act(() => { vi.advanceTimersByTime(1500) })
      expect(onAdvance).toHaveBeenCalledOnce()
    })
  })
})
