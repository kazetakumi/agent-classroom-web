import { useState } from 'react'
import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'

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
  { value: 'wrong',   label: 'Incorrect' },
  { value: 'skipped', label: 'Skipped' },
]

const filterActiveStyle: Record<Filter, { background: string; color: string; border: string }> = {
  all:     { background: '#7c3aed', color: '#fff',     border: '#7c3aed' },
  correct: { background: '#065f46', color: '#6ee7b7',  border: '#065f46' },
  wrong:   { background: '#991b1b', color: '#fca5a5',  border: '#991b1b' },
  skipped: { background: '#374151', color: '#e5e7eb',  border: '#374151' },
}

const ticketTheme: Record<Outcome, { body: string; stub: string; text: string; icon: string }> = {
  correct: { body: '#064e3b', stub: '#065f46', text: '#6ee7b7', icon: '✓' },
  wrong:   { body: '#7f1d1d', stub: '#991b1b', text: '#fca5a5', icon: '✗' },
  skipped: { body: '#1f2937', stub: '#374151', text: '#9ca3af', icon: '—' },
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0f0f13', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 20px 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '999px',
            border: '1px solid #2e303a', background: '#1a1b22',
            color: '#9ca3af', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6', letterSpacing: '-0.02em' }}>
          Review Questions
        </span>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px 20px 4px', overflowX: 'auto' }}>
        {FILTERS.map(({ value, label }) => {
          const active = filter === value
          const activeStyle = filterActiveStyle[value]
          return (
            <button
              key={value}
              data-testid={`filter-${value}`}
              onClick={() => applyFilter(value)}
              style={{
                padding: '6px 16px', borderRadius: '999px', flexShrink: 0,
                border: `1px solid ${active ? activeStyle.border : '#2e303a'}`,
                background: active ? activeStyle.background : '#1a1b22',
                color: active ? activeStyle.color : '#6b7280',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', flex: 1, padding: '20px', alignContent: 'start' }}>
        {pageTiles.map((record) => {
          const question = questionMap.get(record.questionId)
          if (!question) return null
          const outcome = computeOutcome(record.selectedOption, question)
          const theme = ticketTheme[outcome]
          return (
            <button
              key={record.questionId}
              data-testid={`result-tile-${record.questionId}`}
              onClick={() => onOpenExplanation(record.questionId)}
              style={{
                padding: 0, border: 'none', borderRadius: '12px',
                background: theme.body, cursor: 'pointer',
                textAlign: 'left', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              {/* Ticket body */}
              <div style={{ padding: '16px 14px 14px', flex: 1 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', display: 'block', lineHeight: 1 }}>
                  {questionNumber(record.questionId)}
                </span>
              </div>

              {/* Perforation line */}
              <div style={{ position: 'relative', height: '1px', margin: '0 10px' }}>
                {/* left notch */}
                <div style={{ position: 'absolute', left: '-18px', top: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#0f0f13' }} />
                <div style={{ borderTop: '1.5px dashed rgba(255,255,255,0.2)', width: '100%' }} />
                {/* right notch */}
                <div style={{ position: 'absolute', right: '-18px', top: '-8px', width: '16px', height: '16px', borderRadius: '50%', background: '#0f0f13' }} />
              </div>

              {/* Ticket stub */}
              <div style={{ background: theme.stub, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.text }}>{theme.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.text }}>{outcomeLabel[outcome]}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '0 20px 28px' }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={safePage === 0}
          style={{
            padding: '8px 20px', borderRadius: '999px',
            border: '1px solid #2e303a', background: safePage === 0 ? '#1a1b22' : '#2e303a',
            color: safePage === 0 ? '#4b5563' : '#f3f4f6',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: safePage === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          ‹ Prev
        </button>

        <span style={{ fontSize: '0.875rem', color: '#6b7280', minWidth: '60px', textAlign: 'center' }}>
          {safePage + 1} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={safePage === totalPages - 1}
          style={{
            padding: '8px 20px', borderRadius: '999px',
            border: '1px solid #2e303a', background: safePage === totalPages - 1 ? '#1a1b22' : '#2e303a',
            color: safePage === totalPages - 1 ? '#4b5563' : '#f3f4f6',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: safePage === totalPages - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  )
}
