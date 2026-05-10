import { useState } from 'react'
import { QuestionCard } from './components/QuestionCard'
import { SwipeLayer } from './components/SwipeLayer'
import { CompanionSheet } from './components/CompanionSheet'
import { ResultsScreen } from './components/ResultsScreen'
import { ReviewGrid } from './components/ReviewGrid'
import { ExplanationScreen } from './components/ExplanationScreen'
import { loadExplanations } from './explanations/explanations'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const feed = useQuestionFeed()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (feed.status === 'idle') {
    return (
      <div className="screen idle-screen">
        <span className="idle-chip" data-testid="idle-chip">Mathematics</span>
        <h1 className="idle-headline">
          Your next<br />
          <em>revision</em><br />
          session.
        </h1>
        <p className="idle-sub">
          17 questions, randomised order. Swipe right to skip, left to go back.
        </p>
        <div className="idle-meta">
          <span>📚 17 questions</span>
          <span>⏱ ~8 min</span>
        </div>
        <button className="idle-cta" onClick={() => feed.startSession()}>
          Start Revision
        </button>
        <p className="idle-hint">Swipe up anytime to pause</p>
      </div>
    )
  }

  if (feed.status === 'ended') {
    if (feed.view === 'review') {
      return (
        <ReviewGrid
          session={feed.session}
          questions={feed.questions}
          onBack={() => feed.closeReview()}
          onOpenExplanation={(id) => feed.openExplanation(id)}
        />
      )
    }
    if (feed.view === 'explanation') {
      const selectedQuestion = feed.questions.find(q => q.id === feed.selectedQuestionId)!
      const explanation = loadExplanations()[feed.selectedQuestionId!]
      const sessionRecord = feed.session.filter(r => r.questionId === feed.selectedQuestionId).at(-1)
      return (
        <ExplanationScreen
          question={selectedQuestion}
          explanation={explanation}
          selectedOption={sessionRecord?.selectedOption ?? 'skipped'}
          onBack={() => feed.closeExplanation()}
        />
      )
    }
    return (
      <ResultsScreen
        summary={feed.summary!}
        onStartAgain={() => feed.startAgain()}
        onReviewQuestions={() => feed.openReview()}
      />
    )
  }

  const isPaused = feed.status === 'paused'

  const activeCommands = [
    {
      label: 'Pause',
      onSelect: () => {
        feed.pause()
        setSheetOpen(false)
      },
    },
    {
      label: 'End Session',
      onSelect: () => {
        feed.endSession()
        setSheetOpen(false)
      },
    },
  ]

  const pausedCommands = [
    {
      label: 'Resume',
      onSelect: () => {
        feed.resume()
        setSheetOpen(false)
      },
    },
  ]

  return (
    <>
      <SwipeLayer
        onSkip={feed.skip}
        onGoBack={feed.goBack}
        onOpenCompanion={() => setSheetOpen(true)}
      >
        <div style={{ opacity: isPaused ? 0.4 : 1, transition: 'opacity 200ms' }}>
          <QuestionCard
            question={feed.currentQuestion}
            onAnswer={feed.submitAnswer}
            onAdvance={feed.advance}
            currentIndex={feed.currentIndex}
            totalQuestions={feed.questions.length}
          />
        </div>
      </SwipeLayer>

      <CompanionSheet
        isOpen={sheetOpen}
        commands={isPaused ? pausedCommands : activeCommands}
        onClose={() => setSheetOpen(false)}
      />
    </>
  )
}

export default App
