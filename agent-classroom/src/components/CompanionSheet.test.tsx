import { vi, describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CompanionSheet } from './CompanionSheet'

const commands = [
  { label: 'Pause', onSelect: vi.fn() },
  { label: 'End Session', onSelect: vi.fn() },
]

describe('CompanionSheet', () => {
  it('renders a button for each command when open', () => {
    render(
      <CompanionSheet isOpen={true} commands={commands} onClose={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End Session' })).toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    render(
      <CompanionSheet isOpen={true} commands={commands} onClose={onClose} />
    )
    fireEvent.click(screen.getByTestId('companion-backdrop'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('is not in the DOM when isOpen is false', () => {
    render(
      <CompanionSheet isOpen={false} commands={commands} onClose={vi.fn()} />
    )
    expect(screen.queryByTestId('companion-sheet')).not.toBeInTheDocument()
  })
})
