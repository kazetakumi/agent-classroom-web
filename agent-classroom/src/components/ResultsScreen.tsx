import type { SessionSummary } from '../questionFeed/useQuestionFeed'
import './ResultsScreen.css'

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
    <div className="screen results-screen">
      <p className="results-eyebrow">Session Complete</p>
      <div className="results-score-hero">{summary.correct}</div>
      <p className="results-score-denom">out of {summary.totalAttempted}</p>
      <p className="results-score-sub" data-testid="stat-duration">
        correct answers · {formatDuration(summary.durationSeconds)}
      </p>
      <hr className="results-rule" />

      <div className="results-stats">
        <div className="results-stat" data-testid="stat-correct">
          <span className="results-stat-number results-stat-number--correct">{summary.correct}</span>
          <span className="results-stat-label">Correct</span>
        </div>
        <div className="results-stat" data-testid="stat-wrong">
          <span className="results-stat-number results-stat-number--wrong">{summary.wrong}</span>
          <span className="results-stat-label">Wrong</span>
        </div>
        <div className="results-stat" data-testid="stat-skipped">
          <span className="results-stat-number results-stat-number--skipped">{summary.skipped}</span>
          <span className="results-stat-label">Skipped</span>
        </div>
      </div>

      <div className="results-actions">
        {onReviewQuestions && (
          <button className="results-btn-primary" onClick={onReviewQuestions}>
            Review Questions
          </button>
        )}
        <button className="results-btn-ghost" onClick={onStartAgain}>
          Start Again
        </button>
      </div>
    </div>
  )
}
