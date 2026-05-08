import { useState } from 'react'
import { loadQuestions } from './questionBank/questionBank'
import { QuestionCard } from './components/QuestionCard'
import './App.css'

function App() {
  const [questions] = useState(() => loadQuestions())

  return <QuestionCard question={questions[0]} />
}

export default App
