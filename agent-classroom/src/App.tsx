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
      const explanationData = loadExplanations()[feed.selectedQuestionId!]
      const sessionRecord = feed.session.filter(r => r.questionId === feed.selectedQuestionId).at(-1)

      const seenIds = new Set<string>()
      const reviewSequence = feed.session
        .map(r => r.questionId)
        .filter(id => (seenIds.has(id) ? false : (seenIds.add(id), true)))
      const currentIdx = reviewSequence.indexOf(feed.selectedQuestionId!)

      const selectedOption = sessionRecord?.selectedOption
      const selectedAnswer =
        selectedOption && selectedOption !== 'skipped'
          ? selectedQuestion.options[selectedOption as 'A' | 'B' | 'C' | 'D']
          : null
      const correctAnswer = selectedQuestion.options[selectedQuestion.correctOption]
      const explanationText = explanationData?.steps.join(' ') ?? ''

      return (
        <>
          <ExplanationScreen
            question={selectedQuestion.question}
            selectedAnswer={selectedAnswer}
            correctAnswer={correctAnswer}
            explanation={explanationText}
            questionIndex={currentIdx}
            totalQuestions={reviewSequence.length}
            onPrev={() => {
              if (currentIdx > 0) feed.openExplanation(reviewSequence[currentIdx - 1])
            }}
            onNext={() => {
              if (currentIdx < reviewSequence.length - 1)
                feed.openExplanation(reviewSequence[currentIdx + 1])
            }}
            onAskSage={() => setSheetOpen(true)}
            canGoPrev={currentIdx > 0}
            canGoNext={currentIdx < reviewSequence.length - 1}
          />
          {sheetOpen && (
            <SageSheet
              quickActions={['Explain again', 'Give a hint']}
              onDismiss={() => setSheetOpen(false)}
              onQuickAction={() => setSheetOpen(false)}
            />
          )}
        </>
      )
    }
    return (
      <ResultsScreen
        summary={feed.summary!}
        onReview={() => feed.openReview()}
        onAskSage={() => setSheetOpen(true)}
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
