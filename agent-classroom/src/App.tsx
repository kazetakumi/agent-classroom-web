import { useState } from 'react'
import { QuestionCard } from './components/QuestionCard'
import { SwipeLayer } from './components/SwipeLayer'
import { SageSheet } from './components/SageSheet'
import { ResultsScreen } from './components/ResultsScreen'
import { ReviewGrid } from './components/ReviewGrid'
import { ExplanationScreen } from './components/ExplanationScreen'
import { OnboardingName } from './components/OnboardingName'
import { WelcomeScreen } from './components/WelcomeScreen'
import { loadExplanations } from './explanations/explanations'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const [userName, setUserName] = useState<string | null>(
    () => localStorage.getItem('userName')
  )
  const feed = useQuestionFeed()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (userName === null) {
    return (
      <OnboardingName
        onSubmit={(name) => {
          localStorage.setItem('userName', name)
          setUserName(name)
        }}
      />
    )
  }

  if (feed.status === 'idle') {
    return (
      <WelcomeScreen
        userName={userName}
        onBegin={() => feed.startSession()}
      />
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
  const quickActions = isPaused ? ['Resume'] : ['Pause', 'End Session']

  function handleQuickAction(action: string) {
    if (action === 'Pause') feed.pause()
    else if (action === 'End Session') feed.endSession()
    else if (action === 'Resume') feed.resume()
    setSheetOpen(false)
  }

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
            onAskSage={() => setSheetOpen(true)}
            onPrev={feed.goBack}
            onNext={feed.skip}
            canGoPrev={feed.currentIndex > 0}
            canGoNext={true}
          />
        </div>
      </SwipeLayer>

      {sheetOpen && (
        <SageSheet
          quickActions={quickActions}
          onDismiss={() => setSheetOpen(false)}
          onQuickAction={handleQuickAction}
        />
      )}
    </>
  )
}

export default App
