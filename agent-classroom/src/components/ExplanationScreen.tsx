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

function questionNumber(id: string): string {
  const n = parseInt(id.replace(/\D/g, ''), 10)
  return `Q${isNaN(n) ? id : n}`
}

export function ExplanationScreen({ question, explanation, selectedOption, onBack }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const answered = selectedOption !== 'skipped'

  function getState(label: string): 'correct' | 'wrong' | undefined {
    if (label === question.correctOption) return 'correct'
    if (label === selectedOption && answered) return 'wrong'
    return undefined
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '20px 24px 32px', boxSizing: 'border-box', gap: '16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '999px',
            border: '1px solid #d1d5db', background: '#fff',
            color: '#374151', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6b7280' }}>
          {questionNumber(question.id)}
        </span>
      </div>

      {/* Question text */}
      <p style={{ fontSize: '1rem', fontWeight: 500, color: '#111827', margin: 0 }}>{question.question}</p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {labels.map((label) => {
          const state = getState(label)
          const bg = state ? optionBackground[state] : optionBackground.neutral
          const color = state ? optionColor[state] : optionColor.neutral
          const isSelected = label === selectedOption && answered
          const isCorrect = label === question.correctOption

          return (
            <div
              key={label}
              data-testid={`option-${label}`}
              {...(state ? { 'data-state': state } : {})}
              style={{ borderRadius: '10px', background: bg, color, overflow: 'hidden' }}
            >
              <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: 700, minWidth: '20px' }}>{label}.</span>
                <span style={{ flex: 1 }}>{question.options[label]}</span>
              </div>
              {(isSelected || isCorrect) && (
                <div style={{ display: 'flex', gap: '6px', padding: '0 16px 10px', flexWrap: 'wrap' }}>
                  {isCorrect && (
                    <span data-testid={`badge-correct-${label}`} style={{ fontSize: '0.7rem', fontWeight: 700, background: '#065f46', color: '#6ee7b7', padding: '2px 8px', borderRadius: '999px' }}>
                      Correct answer
                    </span>
                  )}
                  {isSelected && !isCorrect && (
                    <span data-testid={`badge-selected-${label}`} style={{ fontSize: '0.7rem', fontWeight: 700, background: '#991b1b', color: '#fca5a5', padding: '2px 8px', borderRadius: '999px' }}>
                      Your answer
                    </span>
                  )}
                  {isSelected && isCorrect && (
                    <span data-testid={`badge-selected-${label}`} style={{ fontSize: '0.7rem', fontWeight: 700, background: '#065f46', color: '#6ee7b7', padding: '2px 8px', borderRadius: '999px' }}>
                      Your answer
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      <div style={{ marginTop: '4px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>Explanation</h2>
        <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {explanation.steps.map((step, i) => (
            <li key={i} style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#374151' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
