import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExplanationScreen } from './ExplanationScreen'

const defaultProps = {
  question: 'What is 2 + 2?',
  selectedAnswer: 'Three',
  correctAnswer: 'Four',
  explanation: 'Basic arithmetic: 2 + 2 = 4.',
  questionIndex: 0,
  totalQuestions: 3,
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onAskSage: vi.fn(),
  canGoPrev: false,
  canGoNext: true,
}

describe('ExplanationScreen', () => {
  it('renders all four section labels in the DOM', () => {
    render(<ExplanationScreen {...defaultProps} />)
    expect(screen.getByText('QUESTION')).toBeInTheDocument()
    expect(screen.getByText('SELECTED')).toBeInTheDocument()
    expect(screen.getByText('CORRECT')).toBeInTheDocument()
    expect(screen.getByText('EXPLANATION')).toBeInTheDocument()
  })

  it('SELECTED shows em dash when selectedAnswer is null', () => {
    render(<ExplanationScreen {...defaultProps} selectedAnswer={null} />)
    expect(screen.getByTestId('field-selected')).toHaveTextContent('—')
  })

  it('SELECTED shows the answer text when selectedAnswer is not null', () => {
    render(<ExplanationScreen {...defaultProps} selectedAnswer="Three" />)
    expect(screen.getByTestId('field-selected')).toHaveTextContent('Three')
  })

  it('SELECTED field has italic style', () => {
    render(<ExplanationScreen {...defaultProps} />)
    const selected = screen.getByTestId('field-selected')
    expect(selected.style.fontStyle).toBe('italic')
  })

  it('SELECTED field has color #C0C0C0', () => {
    render(<ExplanationScreen {...defaultProps} />)
    const selected = screen.getByTestId('field-selected')
    // JSDOM normalizes hex to rgb — accept either form
    expect(selected.style.color).toMatch(/rgb\(192,\s*192,\s*192\)|#c0c0c0/i)
  })

  it('CORRECT field has color #111', () => {
    render(<ExplanationScreen {...defaultProps} />)
    const correct = screen.getByTestId('field-correct')
    // JSDOM normalizes #111 to rgb(17, 17, 17)
    expect(correct.style.color).toMatch(/rgb\(17,\s*17,\s*17\)|#111/)
  })

  it('SageTrigger renders with showNav={true} — nav row is present', () => {
    render(<ExplanationScreen {...defaultProps} />)
    expect(screen.getByTestId('nav-row')).toBeInTheDocument()
  })

  it('NEXT button has pointer-events: none when canGoNext={false}', () => {
    render(<ExplanationScreen {...defaultProps} canGoNext={false} />)
    const nextBtn = screen.getByTestId('next-btn')
    expect(nextBtn.style.pointerEvents).toBe('none')
  })

  it('onPrev is called when PREV button is clicked', () => {
    const onPrev = vi.fn()
    render(<ExplanationScreen {...defaultProps} onPrev={onPrev} canGoPrev={true} />)
    fireEvent.click(screen.getByTestId('prev-btn'))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('component is scoped under .explanation-screen CSS namespace', () => {
    const { container } = render(<ExplanationScreen {...defaultProps} />)
    expect(container.querySelector('.explanation-screen')).toBeInTheDocument()
  })
})
