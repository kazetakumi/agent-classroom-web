import { useState } from 'react'
import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'
import './ReviewGrid.css'

interface Props {
  session: SessionRecord[]
  questions: Question[]
  onBack: () => void
  onOpenExplanation: (questionId: string) => void
}

type Outcome = 'correct' | 'wrong' | 'skipped'
type Filter = 'all' | Outcome

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'correct', label: 'Correct' },
  { value: 'wrong',   label: 'Wrong' },
  { value: 'skipped', label: 'Skipped' },
]

const tileClass: Record<Outcome, string> = {
  correct: 'review-tile review-tile--correct',
  wrong:   'review-tile review-tile--wrong',
  skipped: 'review-tile review-tile--skipped',
}

const outcomeIcon: Record<Outcome, string> = {
  correct: '✓',
  wrong:   '✕',
  skipped: '–',
}

const outcomeLabel: Record<Outcome, string> = {
  correct: 'Correct',
  wrong:   'Wrong',
  skipped: 'Skipped',
}

function computeOutcome(selectedOption: string, question: Question): Outcome {
  if (selectedOption === 'skipped') return 'skipped'
  return selectedOption === question.correctOption ? 'correct' : 'wrong'
}

function questionNumber(id: string): string {
  const n = parseInt(id.replace(/\D/g, ''), 10)
  return `Q${isNaN(n) ? id : n}`
}

const TILES_PER_PAGE = 6

export function ReviewGrid({ session, questions, onBack, onOpenExplanation }: Props) {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')

  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const recordMap = new Map(session.map((r) => [r.questionId, r]))
  const allTiles = Array.from(recordMap.values())

  const tiles = filter === 'all'
    ? allTiles
    : allTiles.filter((r) => {
        const q = questionMap.get(r.questionId)
        return q && computeOutcome(r.selectedOption, q) === filter
      })

  const totalPages = Math.max(1, Math.ceil(tiles.length / TILES_PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)
  const pageTiles = tiles.slice(safePage * TILES_PER_PAGE, (safePage + 1) * TILES_PER_PAGE)

  function applyFilter(f: Filter) {
    setFilter(f)
    setPage(0)
  }

  return (
    <div className="screen review-grid">
      <div className="review-grid-header">
        <button className="review-grid-back" onClick={onBack}>← Results</button>
        <h2 className="review-grid-heading">Review</h2>
      </div>

      <div className="review-grid-filters">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className="review-filter-pill"
            data-testid={`filter-${value}`}
            data-active={filter === value ? 'true' : undefined}
            onClick={() => applyFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="review-grid-tiles">
        {pageTiles.map((record) => {
          const question = questionMap.get(record.questionId)
          if (!question) return null
          const outcome = computeOutcome(record.selectedOption, question)
          return (
            <button
              key={record.questionId}
              className={tileClass[outcome]}
              data-testid={`result-tile-${record.questionId}`}
              onClick={() => onOpenExplanation(record.questionId)}
            >
              <div className="review-tile-top">
                <span className="review-tile-number">{questionNumber(record.questionId)}</span>
                <span className="review-tile-icon">{outcomeIcon[outcome]}</span>
              </div>
              <p className="review-tile-preview">{question.question}</p>
              <span className="review-tile-label">{outcomeLabel[outcome]}</span>
            </button>
          )
        })}
      </div>

      <div className="review-grid-pagination">
        <button
          className="review-pagination-btn"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={safePage === 0}
        >
          ←
        </button>
        <span className="review-pagination-info">
          {safePage + 1} / {totalPages}
        </span>
        <button
          className="review-pagination-btn"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={safePage === totalPages - 1}
        >
          →
        </button>
      </div>
    </div>
  )
}
