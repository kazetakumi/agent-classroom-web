import type { SessionSummary } from '../questionFeed/useQuestionFeed'

interface Props {
  summary: SessionSummary
  onStartAgain: () => void
  onDone?: () => void
  onReviewQuestions?: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function ResultsScreen({ summary, onStartAgain, onReviewQuestions }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '32px 24px', boxSizing: 'border-box' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Session Complete</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div data-testid="stat-correct" style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#d1fae5', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#065f46' }}>{summary.correct}</div>
          <div style={{ fontSize: '0.875rem', color: '#065f46' }}>Correct</div>
        </div>
        <div data-testid="stat-wrong" style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#fee2e2', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#991b1b' }}>{summary.wrong}</div>
          <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>Wrong</div>
        </div>
        <div data-testid="stat-skipped" style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#f3f4f6', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#374151' }}>{summary.skipped}</div>
          <div style={{ fontSize: '0.875rem', color: '#374151' }}>Skipped</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '8px', color: '#6b7280' }}>
        Total attempted: {summary.totalAttempted}
      </div>
      <div data-testid="stat-duration" style={{ textAlign: 'center', marginBottom: '32px', color: '#6b7280' }}>
        {formatDuration(summary.durationSeconds)}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {onReviewQuestions && (
          <button
            onClick={onReviewQuestions}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Review Questions
          </button>
        )}
        <button
          onClick={onStartAgain}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Start Again
        </button>
      </div>
    </div>
  )
}
