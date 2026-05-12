import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SageSheet } from './SageSheet'

const defaultProps = {
  quickActions: ['give you a hint', 'skip this question'],
  onDismiss: vi.fn(),
  onQuickAction: vi.fn(),
}

describe('SageSheet', () => {
  it('renders all quick actions as chips', () => {
    render(<SageSheet {...defaultProps} />)
    expect(screen.getByText('give you a hint')).toBeInTheDocument()
    expect(screen.getByText('skip this question')).toBeInTheDocument()
  })

  it('calls onDismiss when pill handle is clicked', () => {
    const onDismiss = vi.fn()
    render(<SageSheet {...defaultProps} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('pill-handle'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('calls onQuickAction with the action text when a chip is selected', () => {
    const onQuickAction = vi.fn()
    render(<SageSheet {...defaultProps} onQuickAction={onQuickAction} />)
    fireEvent.click(screen.getByText('give you a hint'))
    expect(onQuickAction).toHaveBeenCalledWith('give you a hint')
  })

  it('fades non-selected chips after selecting one', () => {
    render(<SageSheet {...defaultProps} />)
    const chips = screen.getAllByTestId('action-chip')
    fireEvent.click(chips[0])
    expect(parseFloat(chips[1].style.opacity)).toBeLessThan(1)
  })

  it('pill handle is present in the sheet', () => {
    render(<SageSheet {...defaultProps} />)
    expect(screen.getByTestId('pill-handle')).toBeInTheDocument()
  })

  it('YOU input row is present for free-text entry', () => {
    render(<SageSheet {...defaultProps} />)
    expect(screen.getByTestId('you-input')).toBeInTheDocument()
  })

  it('submitting the text input calls onQuickAction with the entered text', () => {
    const onQuickAction = vi.fn()
    render(<SageSheet {...defaultProps} onQuickAction={onQuickAction} />)
    const input = screen.getByTestId('you-input')
    fireEvent.change(input, { target: { value: 'Can you explain this?' } })
    fireEvent.submit(input.closest('form')!)
    expect(onQuickAction).toHaveBeenCalledWith('Can you explain this?')
  })
})
