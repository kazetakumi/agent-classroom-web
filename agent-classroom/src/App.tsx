import { useState } from 'react'
import { loadQuestions } from './questionBank/questionBank'
import { QuestionCard } from './components/QuestionCard'
import { useQuestionFeed } from './questionFeed/useQuestionFeed'
import './App.css'

function App() {
  const [questions] = useState(() => loadQuestions())
  const feed = useQuestionFeed(questions)

  return (
    <QuestionCard
      question={feed.currentQuestion}
      onAnswer={feed.submitAnswer}
      onAdvance={feed.advance}
    />
  )
}

export default App
