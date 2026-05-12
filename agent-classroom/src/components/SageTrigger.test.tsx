import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SageTrigger } from './SageTrigger'

const defaultProps = {
  onAskSage: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  canGoPrev: true,
  canGoNext: true,
  progress: 0.5,
  showNav: true,
}

describe('SageTrigger', () => {
  it('renders the Sage strip with its label', () => {
    render(<SageTrigger {...defaultProps} />)
    expect(screen.getByTestId('sage-strip')).toBeInTheDocument()
    expect(screen.getByText(/ask me anything/i)).toBeInTheDocument()
  })

  it('renders nav row when showNav={true}', () => {
    render(<SageTrigger {...defaultProps} showNav={true} />)
    expect(screen.getByTestId('nav-row')).toBeInTheDocument()
  })

  it('does not render nav row when showNav={false}', () => {
    render(<SageTrigger {...defaultProps} showNav={false} />)
    expect(screen.queryByTestId('nav-row')).not.toBeInTheDocument()
  })

  it('calls onPrev when PREV button is clicked', () => {
    const onPrev = vi.fn()
    render(<SageTrigger {...defaultProps} onPrev={onPrev} canGoPrev={true} />)
    fireEvent.click(screen.getByTestId('prev-btn'))
    expect(onPrev).toHaveBeenCalledOnce()
  })

  it('calls onNext when NEXT button is clicked', () => {
    const onNext = vi.fn()
    render(<SageTrigger {...defaultProps} onNext={onNext} canGoNext={true} />)
    fireEvent.click(screen.getByTestId('next-btn'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('PREV button has pointer-events: none when canGoPrev={false}', () => {
    render(<SageTrigger {...defaultProps} canGoPrev={false} />)
    const prev = screen.getByTestId('prev-btn')
    expect(prev.style.pointerEvents).toBe('none')
  })

  it('progress bar width reflects the progress prop (0–1 → 0%–100%)', () => {
    render(<SageTrigger {...defaultProps} progress={0.4} />)
    const bar = screen.getByTestId('progress-bar')
    expect(bar.style.width).toMatch(/%$/)
    expect(parseFloat(bar.style.width)).toBeCloseTo(40, 0)
  })

  it('calls onAskSage when the Sage strip is tapped', () => {
    const onAskSage = vi.fn()
    render(<SageTrigger {...defaultProps} onAskSage={onAskSage} />)
    fireEvent.click(screen.getByTestId('sage-strip'))
    expect(onAskSage).toHaveBeenCalledOnce()
  })
})
