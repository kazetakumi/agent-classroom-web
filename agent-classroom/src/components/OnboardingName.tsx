import { useState } from 'react'
import './OnboardingName.css'

interface OnboardingNameProps {
  onSubmit: (name: string) => void
}

export function OnboardingName({ onSubmit }: OnboardingNameProps) {
  const [value, setValue] = useState('')

  const hasContent = value.trim().length > 0

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="screen onboarding-name">
      <div className="col-grid onboarding-name__turn">
        <span className="onboarding-name__label">Sage</span>
        <div className="onboarding-name__rule" />
        <p className="onboarding-name__text">
          Hello. I'm Sage, your revision companion.
        </p>
      </div>
      <div className="col-grid onboarding-name__turn">
        <span className="onboarding-name__label">Sage</span>
        <div className="onboarding-name__rule" />
        <p className="onboarding-name__text">
          What should I call you?
        </p>
      </div>

      <div className="onboarding-name__spacer" />

      <div className="onboarding-name__input-row">
        <input
          className="onboarding-name__input"
          type="text"
          placeholder="Your first name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Your first name"
        />
        <button
          className="onboarding-name__arrow"
          data-testid="submit-arrow"
          data-active={String(hasContent)}
          onClick={handleSubmit}
          aria-label="Submit name"
        >
          →
        </button>
      </div>
    </div>
  )
}
