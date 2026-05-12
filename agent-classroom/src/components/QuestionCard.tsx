import { useEffect, useRef, useState } from 'react'
import type { Question } from '../questionBank/questionBank'
import { SageTrigger } from './SageTrigger'
import './QuestionCard.css'

interface Props {
  question: Question
  onAnswer: (selected: string) => void
  onAdvance: () => void
  currentIndex: number
  totalQuestions: number
  onAskSage: () => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export function QuestionCard({
  question,
  onAnswer,
  onAdvance,
  currentIndex,
  totalQuestions,
  onAskSage,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: Props) {
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

  const progress = totalQuestions > 0 ? currentIndex / totalQuestions : 0

  return (
    <div className="screen question-card">
      <span className="question-card__subject">{question.subject}</span>
      <p className="question-card__text">{question.question}</p>
      <div className="question-card__options">
        {labels.map((label) => (
          <button
            key={label}
            className="question-card__option"
            type="button"
            data-state={selected === label ? 'selected' : undefined}
            onClick={() => handleOptionClick(label)}
            style={{ opacity: selected !== null && selected !== label ? 0.3 : 1 }}
          >
            <span className="question-card__option-letter">{label}</span>
            <span className="question-card__option-text">{question.options[label]}</span>
          </button>
        ))}
      </div>
      <div className="question-card__spacer" />
      <SageTrigger
        showNav={true}
        onAskSage={onAskSage}
        onPrev={onPrev}
        onNext={onNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        progress={progress}
      />
    </div>
  )
}
