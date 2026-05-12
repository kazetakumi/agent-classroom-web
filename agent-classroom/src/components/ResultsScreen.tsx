import { SageTrigger } from './SageTrigger'
import type { SessionSummary } from '../questionFeed/useQuestionFeed'
import './ResultsScreen.css'

interface Props {
  summary: SessionSummary
  onReview: () => void
  onAskSage: () => void
}

function formatScore(correct: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((correct / total) * 100)}%`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function ResultsScreen({ summary, onReview, onAskSage }: Props) {
  return (
    <div className="results-screen">
      <div className="results-screen__ledger">
        <div className="ledger-row" data-testid="ledger-row-correct">
          <span className="ledger-label">Correct</span>
          <div className="ledger-rule" />
          <span className="ledger-value">{summary.correct}</span>
        </div>
        <div className="ledger-row" data-testid="ledger-row-wrong">
          <span className="ledger-label">Wrong</span>
          <div className="ledger-rule" />
          <span className="ledger-value ledger-value-dim">{summary.wrong}</span>
        </div>
        <div className="ledger-row" data-testid="ledger-row-skipped">
          <span className="ledger-label">Skipped</span>
          <div className="ledger-rule" />
          <span className="ledger-value ledger-value-dim">{summary.skipped}</span>
        </div>
        <div className="ledger-row" data-testid="ledger-row-score">
          <span className="ledger-label">Score</span>
          <div className="ledger-rule" />
          <span className="ledger-value">{formatScore(summary.correct, summary.totalAttempted)}</span>
        </div>
        <div className="ledger-row" data-testid="ledger-row-time">
          <span className="ledger-label">Time</span>
          <div className="ledger-rule" />
          <span className="ledger-value ledger-value-dim">{formatDuration(summary.durationSeconds)}</span>
        </div>
      </div>

      <div className="results-screen__spacer" />

      <p className="results-screen__sage-comment">
        Good effort. Review your answers to see where you can improve.
      </p>

      <div className="results-screen__your-move">
        <span className="results-screen__break-label">Your move</span>
        <button className="results-screen__review-btn" onClick={onReview}>
          Review answers →
        </button>
      </div>

      <SageTrigger
        showNav={false}
        onAskSage={onAskSage}
        onPrev={() => {}}
        onNext={() => {}}
        canGoPrev={false}
        canGoNext={false}
        progress={0}
      />
    </div>
  )
}
