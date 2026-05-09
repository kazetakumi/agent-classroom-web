import { useState } from 'react'
import { loadQuestions } from './questionBank/questionBank'
import { QuestionCard } from './components/QuestionCard'
import { SwipeLayer } from './components/SwipeLayer'
import { CompanionSheet } from './components/CompanionSheet'
import { ResultsScreen } from './components/ResultsScreen'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const [questions] = useState(() => loadQuestions())
  const feed = useQuestionFeed(questions)
  const [sheetOpen, setSheetOpen] = useState(false)

  if (feed.status === 'ended') {
    return <ResultsScreen />
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
