import type { Question } from '../questionBank/questionBank'
import type { Explanation } from '../explanations/explanations'

interface Props {
  question: Question
  explanation: Explanation
  selectedOption: string
  onBack: () => void
}

const optionBackground: Record<string, string> = {
  correct: '#d1fae5',
  wrong: '#fee2e2',
  neutral: '#f3f4f6',
}

const optionColor: Record<string, string> = {
  correct: '#065f46',
  wrong: '#991b1b',
  neutral: '#374151',
}

export function ExplanationScreen({ question, explanation, selectedOption, onBack }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const

  function getState(label: string): 'correct' | 'wrong' | undefined {
    if (label === question.correctOption) return 'correct'
    if (label === selectedOption && selectedOption !== 'skipped') return 'wrong'
    return undefined
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '32px 24px', boxSizing: 'border-box', gap: '16px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>{question.subject}</h1>
      <p style={{ fontSize: '1rem', fontWeight: 500 }}>{question.question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {labels.map((label) => {
          const state = getState(label)
          const bg = state ? optionBackground[state] : optionBackground.neutral
          const color = state ? optionColor[state] : optionColor.neutral
          return (
            <div
              key={label}
              data-testid={`option-${label}`}
              {...(state ? { 'data-state': state } : {})}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: bg,
                color,
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontWeight: 700, minWidth: '20px' }}>{label}.</span>
              <span>{question.options[label]}</span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '8px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Explanation</h2>
        <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {explanation.steps.map((step, i) => (
            <li key={i} style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <button
          onClick={onBack}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
