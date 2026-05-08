import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('renders four option buttons labelled A, B, C, D', () => {
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText(/^A\b/)).toBeInTheDocument()
    expect(screen.getByText(/^B\b/)).toBeInTheDocument()
    expect(screen.getByText(/^C\b/)).toBeInTheDocument()
    expect(screen.getByText(/^D\b/)).toBeInTheDocument()
  })

  it('renders each option text', () => {
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText(/3/)).toBeInTheDocument()
    expect(screen.getByText(/4/)).toBeInTheDocument()
    expect(screen.getByText(/5/)).toBeInTheDocument()
    expect(screen.getByText(/6/)).toBeInTheDocument()
  })
})
