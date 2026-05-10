import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('Idle Screen', () => {
  it('renders with idle-screen class', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.idle-screen')).toBeInTheDocument()
  })

  it('renders the subject chip', () => {
    render(<App />)
    expect(screen.getByTestId('idle-chip')).toBeInTheDocument()
  })

  it('renders the Start Revision CTA with idle-cta class', () => {
    const { container } = render(<App />)
    const btn = container.querySelector('.idle-cta')
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Start Revision')
  })
})
