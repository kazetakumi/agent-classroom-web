import { useState } from 'react'
import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'
import { SageTrigger } from './SageTrigger'
import './ReviewGrid.css'

interface Props {
  session: SessionRecord[]
  questions: Question[]
  onBack: () => void
  onOpenExplanation: (questionId: string) => void
  onAskSage?: () => void
}

type Outcome = 'correct' | 'wrong' | 'skipped'
type Filter = 'all' | Outcome

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',     label: 'ALL' },
  { value: 'wrong',   label: 'WRONG' },
  { value: 'skipped', label: 'SKIPPED' },
  { value: 'correct', label: 'CORRECT' },
]

function computeOutcome(selectedOption: string, question: Question): Outcome {
  if (selectedOption === 'skipped') return 'skipped'
  return selectedOption === question.correctOption ? 'correct' : 'wrong'
}

export function ReviewGrid({
  session,
  questions,
  onBack,
  onOpenExplanation,
  onAskSage = () => {},
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const recordMap = new Map(session.map((r) => [r.questionId, r]))
  const allSeats = Array.from(recordMap.values())

  const seats =
    filter === 'all'
      ? allSeats
      : allSeats.filter((r) => {
          const q = questionMap.get(r.questionId)
          return q && computeOutcome(r.selectedOption, q) === filter
        })

  return (
    <div className="screen review-grid">
      <div className="review-grid__header">
        <button className="review-grid__back" onClick={onBack}>
          ← Results
        </button>
        <h2 className="review-grid__heading">Review</h2>
      </div>

      <div className="review-grid__legend">
        <span
          className="review-grid__legend-dot review-grid__legend-dot--correct"
          data-testid="legend-correct"
        />
        <span className="review-grid__legend-text">Correct</span>
        <span
          className="review-grid__legend-dot review-grid__legend-dot--wrong"
          data-testid="legend-wrong"
        />
        <span className="review-grid__legend-text">Wrong</span>
        <span
          className="review-grid__legend-dot review-grid__legend-dot--skipped"
          data-testid="legend-skipped"
        />
        <span className="review-grid__legend-text">Skipped</span>
      </div>

      <div className="review-grid__filters">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className="review-grid__filter-tab"
            data-testid={`filter-${value}`}
            data-active={filter === value ? 'true' : undefined}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="review-grid__seats">
        {seats.map((record) => {
          const question = questionMap.get(record.questionId)
          if (!question) return null
          const outcome = computeOutcome(record.selectedOption, question)
          return (
            <button
              key={record.questionId}
              className={`seat seat--${outcome}`}
              data-testid={`result-tile-${record.questionId}`}
              onClick={() => onOpenExplanation(record.questionId)}
            />
          )
        })}
      </div>

      <SageTrigger
        showNav={true}
        onAskSage={onAskSage}
        onPrev={onBack}
        onNext={() => {}}
        canGoPrev={true}
        canGoNext={false}
        progress={0}
      />
    </div>
  )
}
