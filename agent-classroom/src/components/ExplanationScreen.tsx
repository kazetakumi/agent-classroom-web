import type { Question } from '../questionBank/questionBank'
import type { Explanation } from '../explanations/explanations'
import './ExplanationScreen.css'

interface Props {
  question: Question
  explanation: Explanation
  selectedOption: string
  onBack: () => void
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
    <div className="screen explanation-screen">
      <div className="explanation-header">
        <button className="explanation-back" onClick={onBack}>← Review</button>
        <p className="explanation-meta" data-testid="explanation-meta">
          {question.subject} · {questionNumber(question.id)}
        </p>
        <p className="explanation-question">{question.question}</p>
      </div>

      <div className="explanation-options">
        {labels.map((label) => {
          const state = getState(label)
          const isSelected = label === selectedOption && answered
          const isCorrect = label === question.correctOption

          return (
            <div
              key={label}
              className="explanation-option"
              data-testid={`option-${label}`}
              {...(state ? { 'data-state': state } : {})}
            >
              <span className="explanation-option-label">{label}.</span>
              <span className="explanation-option-text">{question.options[label]}</span>
              {isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-correct-${label}`}
                >
                  Correct answer
                </span>
              )}
              {isSelected && !isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-selected-${label}`}
                >
                  Your answer
                </span>
              )}
              {isSelected && isCorrect && (
                <span
                  className="explanation-option-tag"
                  data-testid={`badge-selected-${label}`}
                >
                  Your answer
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="explanation-steps">
        <p className="explanation-steps-label">Explanation</p>
        {explanation.steps.map((step, i) => (
          <div key={i} className="explanation-step">
            <span className="explanation-step-number">{i + 1}</span>
            <p className="explanation-step-text">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
