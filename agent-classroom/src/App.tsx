import { useState } from 'react'
import { loadQuestions } from './questionBank/questionBank'
import { QuestionCard } from './components/QuestionCard'
import { SwipeLayer } from './components/SwipeLayer'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const [questions] = useState(() => loadQuestions())
  const feed = useQuestionFeed(questions)

  return (
    <SwipeLayer
      onSkip={feed.skip}
      onGoBack={feed.goBack}
      onOpenCompanion={() => {}}
    >
      <QuestionCard
        question={feed.currentQuestion}
        onAnswer={feed.submitAnswer}
        onAdvance={feed.advance}
      />
    </SwipeLayer>
  )
}

export default App
