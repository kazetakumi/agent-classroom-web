import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExplanationScreen } from './ExplanationScreen'
import type { Question } from '../questionBank/questionBank'
import type { Explanation } from '../explanations/explanations'

const question: Question = {
  id: 'q001',
  subject: 'Mathematics',
  question: 'What is 2 + 2?',
  options: { A: 'Three', B: 'Four', C: 'Five', D: 'Six' },
  correctOption: 'B',
}

const explanation: Explanation = {
  steps: ['Step 1 — Basic arithmetic.', 'Step 2 — The answer is four.'],
}

describe('ExplanationScreen', () => {
  it('does not render the subject heading', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.queryByText('Mathematics')).not.toBeInTheDocument()
  })

  it('renders the question number', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Q1')).toBeInTheDocument()
  })

  it('renders the question text', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
  })

  it('renders all four option texts', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Three')).toBeInTheDocument()
    expect(screen.getByText('Four')).toBeInTheDocument()
    expect(screen.getByText('Five')).toBeInTheDocument()
    expect(screen.getByText('Six')).toBeInTheDocument()
  })

  it('correct option has data-state="correct"', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('option-B')).toHaveAttribute('data-state', 'correct')
  })

  it('wrong selected option has data-state="wrong"', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('option-A')).toHaveAttribute('data-state', 'wrong')
  })

  it('unselected non-correct options have no data-state', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('option-C')).not.toHaveAttribute('data-state')
    expect(screen.getByTestId('option-D')).not.toHaveAttribute('data-state')
  })

  it('wrong answer: shows "Your answer" badge on selected and "Correct answer" badge on correct', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('badge-selected-A')).toHaveTextContent('Your answer')
    expect(screen.getByTestId('badge-correct-B')).toHaveTextContent('Correct answer')
  })

  it('correct answer: shows "Correct answer" and "Your answer" badges on the same option', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="B"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('badge-correct-B')).toHaveTextContent('Correct answer')
    expect(screen.getByTestId('badge-selected-B')).toHaveTextContent('Your answer')
    expect(screen.queryByTestId('badge-selected-A')).not.toBeInTheDocument()
  })

  it('skipped: only "Correct answer" badge shown, no "Your answer" badge', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="skipped"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('badge-correct-B')).toHaveTextContent('Correct answer')
    expect(screen.queryByText('Your answer')).not.toBeInTheDocument()
  })

  it('when student answered correctly, only correct option has data-state, no wrong marker', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="B"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('option-B')).toHaveAttribute('data-state', 'correct')
    expect(screen.getByTestId('option-A')).not.toHaveAttribute('data-state')
    expect(screen.getByTestId('option-C')).not.toHaveAttribute('data-state')
    expect(screen.getByTestId('option-D')).not.toHaveAttribute('data-state')
  })

  it('skipped: correct option is "correct", no option is "wrong"', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="skipped"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByTestId('option-B')).toHaveAttribute('data-state', 'correct')
    expect(screen.getByTestId('option-A')).not.toHaveAttribute('data-state')
    expect(screen.getByTestId('option-C')).not.toHaveAttribute('data-state')
    expect(screen.getByTestId('option-D')).not.toHaveAttribute('data-state')
  })

  it('renders all explanation steps', () => {
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={vi.fn()}
      />,
    )
    expect(screen.getByText('Step 1 — Basic arithmetic.')).toBeInTheDocument()
    expect(screen.getByText('Step 2 — The answer is four.')).toBeInTheDocument()
  })

  it('"Back" button calls onBack', () => {
    const onBack = vi.fn()
    render(
      <ExplanationScreen
        question={question}
        explanation={explanation}
        selectedOption="A"
        onBack={onBack}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /back/i }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
