import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingName } from './OnboardingName'

describe('OnboardingName', () => {
  it('empty submit via arrow button is a no-op — onSubmit not called', () => {
    const onSubmit = vi.fn()
    render(<OnboardingName onSubmit={onSubmit} />)
    fireEvent.click(screen.getByTestId('submit-arrow'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('non-empty submit calls onSubmit with trimmed value', () => {
    const onSubmit = vi.fn()
    render(<OnboardingName onSubmit={onSubmit} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Alice  ' } })
    fireEvent.click(screen.getByTestId('submit-arrow'))
    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith('Alice')
  })

  it('Return key triggers submit with trimmed value', () => {
    const onSubmit = vi.fn()
    render(<OnboardingName onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Rohan' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('Rohan')
  })

  it('Return key on empty input does not call onSubmit', () => {
    const onSubmit = vi.fn()
    render(<OnboardingName onSubmit={onSubmit} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('arrow button has data-active="false" when input is empty', () => {
    render(<OnboardingName onSubmit={vi.fn()} />)
    expect(screen.getByTestId('submit-arrow')).toHaveAttribute('data-active', 'false')
  })

  it('arrow button has data-active="true" when input has content', () => {
    render(<OnboardingName onSubmit={vi.fn()} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Priya' } })
    expect(screen.getByTestId('submit-arrow')).toHaveAttribute('data-active', 'true')
  })
})
