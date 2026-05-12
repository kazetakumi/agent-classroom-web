import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeScreen } from './WelcomeScreen'

describe('WelcomeScreen', () => {
  it('renders stored name in greeting text', () => {
    render(<WelcomeScreen userName="Alice" onBegin={vi.fn()} />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('"Begin" button click calls onBegin prop', () => {
    const onBegin = vi.fn()
    render(<WelcomeScreen userName="Alice" onBegin={onBegin} />)
    fireEvent.click(screen.getByRole('button', { name: /begin/i }))
    expect(onBegin).toHaveBeenCalledOnce()
  })

  it('redirect input is present in the DOM', () => {
    render(<WelcomeScreen userName="Alice" onBegin={vi.fn()} />)
    expect(
      screen.getByPlaceholderText(/Or tell Sage something different/i)
    ).toBeInTheDocument()
  })

  it('session summary shows topic, question count, level, and duration', () => {
    render(<WelcomeScreen userName="Alice" onBegin={vi.fn()} />)
    expect(screen.getByText(/Mathematics/i)).toBeInTheDocument()
    expect(screen.getByText(/17/)).toBeInTheDocument()
    expect(screen.getByText(/JEE/i)).toBeInTheDocument()
    expect(screen.getByText(/min/i)).toBeInTheDocument()
  })

  it('does not render a SageTrigger sage-strip', () => {
    const { container } = render(<WelcomeScreen userName="Alice" onBegin={vi.fn()} />)
    expect(container.querySelector('[data-testid="sage-strip"]')).not.toBeInTheDocument()
  })
})
