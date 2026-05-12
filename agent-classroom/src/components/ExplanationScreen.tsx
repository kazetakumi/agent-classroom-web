import { SageTrigger } from './SageTrigger'
import './ExplanationScreen.css'

interface Props {
  question: string
  selectedAnswer: string | null
  correctAnswer: string
  explanation: string
  questionIndex: number
  totalQuestions: number
  onPrev: () => void
  onNext: () => void
  onAskSage: () => void
  canGoPrev: boolean
  canGoNext: boolean
}

export function ExplanationScreen({
  question,
  selectedAnswer,
  correctAnswer,
  explanation,
  questionIndex,
  totalQuestions,
  onPrev,
  onNext,
  onAskSage,
  canGoPrev,
  canGoNext,
}: Props) {
  return (
    <div className="screen explanation-screen">
      <div className="explanation-screen__fields">
        <div className="explanation-screen__field">
          <div className="explanation-screen__label">QUESTION</div>
          <div className="explanation-screen__value" data-testid="field-question">
            {question}
          </div>
        </div>

        <div className="explanation-screen__field">
          <div className="explanation-screen__label">SELECTED</div>
          <div
            className="explanation-screen__value"
            data-testid="field-selected"
            style={{ fontStyle: 'italic', color: '#C0C0C0' }}
          >
            {selectedAnswer ?? '—'}
          </div>
        </div>

        <div className="explanation-screen__field">
          <div className="explanation-screen__label">CORRECT</div>
          <div
            className="explanation-screen__value"
            data-testid="field-correct"
            style={{ color: '#111' }}
          >
            {correctAnswer}
          </div>
        </div>

        <div className="explanation-screen__field">
          <div className="explanation-screen__label">EXPLANATION</div>
          <div className="explanation-screen__value" data-testid="field-explanation">
            {explanation}
          </div>
        </div>
      </div>

      <SageTrigger
        showNav={true}
        onAskSage={onAskSage}
        onPrev={onPrev}
        onNext={onNext}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        progress={(questionIndex + 1) / Math.max(totalQuestions, 1)}
      />
    </div>
  )
}
