import type { SessionRecord } from '../questionFeed/useQuestionFeed'
import type { Question } from '../questionBank/questionBank'

interface Props {
  session: SessionRecord[]
  questions: Question[]
  onBack: () => void
  onOpenExplanation: (questionId: string) => void
}

type Outcome = 'correct' | 'wrong' | 'skipped'

const tileBackground: Record<Outcome, string> = {
  correct: '#d1fae5',
  wrong: '#fee2e2',
  skipped: '#f3f4f6',
}

const tileColor: Record<Outcome, string> = {
  correct: '#065f46',
  wrong: '#991b1b',
  skipped: '#374151',
}

const outcomeLabel: Record<Outcome, string> = {
  correct: 'Correct',
  wrong: 'Wrong',
  skipped: 'Skipped',
}

function computeOutcome(selectedOption: string, question: Question): Outcome {
  if (selectedOption === 'skipped') return 'skipped'
  return selectedOption === question.correctOption ? 'correct' : 'wrong'
}

export function ReviewGrid({ session, questions, onBack, onOpenExplanation }: Props) {
  const questionMap = new Map(questions.map((q) => [q.id, q]))
  // Deduplicate: last record per questionId wins (matches computeSummary logic)
  const recordMap = new Map(session.map((r) => [r.questionId, r]))
  const tiles = Array.from(recordMap.values())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '32px 24px', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Review Questions</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', flex: 1 }}>
        {tiles.map((record) => {
          const question = questionMap.get(record.questionId)
          if (!question) return null
          const outcome = computeOutcome(record.selectedOption, question)
          return (
            <button
              key={record.questionId}
              data-testid={`result-tile-${record.questionId}`}
              onClick={() => onOpenExplanation(record.questionId)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: tileBackground[outcome],
                color: tileColor[outcome],
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{question.subject}</span>
              <span style={{ fontSize: '0.75rem' }}>{outcomeLabel[outcome]}</span>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: '24px' }}>
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
