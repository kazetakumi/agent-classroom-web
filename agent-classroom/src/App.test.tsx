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

  it('returning user (localStorage.userName set) skips to Welcome screen', () => {
    localStorage.setItem('userName', 'Alice')
    render(<App />)
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument()
  })
})

describe('Welcome screen (returning user)', () => {
  beforeEach(() => {
    localStorage.setItem('userName', 'Alice')
  })

  it('greets the user by name', () => {
    render(<App />)
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
  })

  it('renders a Begin button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /begin/i })).toBeInTheDocument()
  })

  it('renders the redirect input', () => {
    render(<App />)
    expect(
      screen.getByPlaceholderText(/Or tell Sage something different/i)
    ).toBeInTheDocument()
  })
})
