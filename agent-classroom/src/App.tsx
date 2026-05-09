import { useState } from 'react'
import { QuestionCard } from './components/QuestionCard'
import { SwipeLayer } from './components/SwipeLayer'
import { CompanionSheet } from './components/CompanionSheet'
import { ResultsScreen } from './components/ResultsScreen'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const feed = useQuestionFeed()
  const [sheetOpen, setSheetOpen] = useState(false)

  if (feed.status === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: '16px' }}>
        <h1>Agent Classroom</h1>
        <button
          onClick={() => feed.startSession()}
          style={{ padding: '16px 32px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Start Revision
        </button>
      </div>
    )
  }

  if (feed.status === 'ended') {
    return (
      <ResultsScreen
        summary={feed.summary!}
        onStartAgain={() => feed.startAgain()}
        onDone={() => feed.returnToIdle()}
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
