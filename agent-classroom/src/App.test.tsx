import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('Entry guard', () => {
  it('first-time user (no localStorage.userName) sees OnboardingName screen', () => {
    render(<App />)
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument()
  })

  it('returning user (localStorage.userName set) skips to Welcome/Idle screen', () => {
    localStorage.setItem('userName', 'Alice')
    const { container } = render(<App />)
    expect(container.querySelector('.idle-screen')).toBeInTheDocument()
  })
})

describe('Idle Screen (returning user)', () => {
  beforeEach(() => {
    localStorage.setItem('userName', 'Alice')
  })

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
