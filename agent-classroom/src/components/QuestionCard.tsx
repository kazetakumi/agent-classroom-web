import { useEffect, useRef, useState } from 'react'
import type { Question } from '../questionBank/questionBank'
import './QuestionCard.css'

interface Props {
  question: Question
  onAnswer: (selected: string) => void
  onAdvance: () => void
}

export function QuestionCard({ question, onAnswer, onAdvance }: Props) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const [selected, setSelected] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setSelected(null)
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [question.id])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [])

  function handleOptionClick(label: string) {
    if (selected !== null) return
    setSelected(label)
    onAnswer(label)
    timerRef.current = setTimeout(() => {
      onAdvance()
    }, 1500)
  }

  return (
    <div className="question-card">
      <p className="question-text">{question.question}</p>
      <div className="options">
        {labels.map((label) => (
          <button
            key={label}
            className="option-btn"
            type="button"
            disabled={selected !== null}
            data-state={selected === label ? 'selected' : undefined}
            onClick={() => handleOptionClick(label)}
          >
            <span className="option-label">{label}</span>
            <span className="option-text">{question.options[label]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
