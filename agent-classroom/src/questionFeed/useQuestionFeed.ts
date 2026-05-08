import { useState } from 'react'
import type { Question } from '../questionBank/questionBank'

export interface SessionRecord {
  questionId: string
  selectedOption: string
}

interface FeedState {
  questions: Question[]
  currentIndex: number
  session: SessionRecord[]
  status: 'active'
}

export function useQuestionFeed(questions: Question[]) {
  const [state, setState] = useState<FeedState>({
    questions,
    currentIndex: 0,
    session: [],
    status: 'active',
  })

  const currentQuestion = state.questions[state.currentIndex]

  function submitAnswer(selectedOption: string) {
    setState((prev) => ({
      ...prev,
      session: [
        ...prev.session,
        { questionId: prev.questions[prev.currentIndex].id, selectedOption },
      ],
    }))
  }

  function advance() {
    setState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }))
  }

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    session: state.session,
    submitAnswer,
    advance,
  }
}
