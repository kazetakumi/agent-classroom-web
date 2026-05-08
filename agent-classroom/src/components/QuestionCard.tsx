import type { Question } from '../questionBank/questionBank'
import './QuestionCard.css'

interface Props {
  question: Question
}

export function QuestionCard({ question }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const

  return (
    <div className="question-card">
      <p className="question-text">{question.question}</p>
      <div className="options">
        {labels.map((label) => (
          <button key={label} className="option-btn" type="button">
            <span className="option-label">{label}</span>
            <span className="option-text">{question.options[label]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
