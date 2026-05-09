import { useState } from 'react'
import { loadQuestions } from '../questionBank/questionBank'
import type { Question } from '../questionBank/questionBank'

export interface SessionRecord {
  questionId: string
  selectedOption: string
}

interface FeedState {
  questions: Question[]
  currentIndex: number
  session: SessionRecord[]
  status: 'active' | 'paused' | 'ended'
  sessionEndTime: number | null
}

function nextStateWithAdvance(prev: FeedState): FeedState {
  const nextIndex = prev.currentIndex + 1
  if (nextIndex > prev.questions.length - 1) {
    return { ...prev, questions: loadQuestions(), currentIndex: 0 }
  }
  return { ...prev, currentIndex: nextIndex }
}

export function useQuestionFeed(initialQuestions: Question[]) {
  const [state, setState] = useState<FeedState>({
    questions: initialQuestions,
    currentIndex: 0,
    session: [],
    status: 'active',
    sessionEndTime: null,
  })

  const currentQuestion = state.questions[state.currentIndex]

  function submitAnswer(selectedOption: string) {
    if (state.status !== 'active') return
    setState((prev) => ({
      ...prev,
      session: [
        ...prev.session,
        { questionId: prev.questions[prev.currentIndex].id, selectedOption },
      ],
    }))
  }

  function advance() {
    if (state.status !== 'active') return
    setState(nextStateWithAdvance)
  }

  function skip() {
    if (state.status !== 'active') return
    setState((prev) => {
      const record: SessionRecord = {
        questionId: prev.questions[prev.currentIndex].id,
        selectedOption: 'skipped',
      }
      return nextStateWithAdvance({ ...prev, session: [...prev.session, record] })
    })
  }

  function goBack() {
    if (state.status !== 'active') return
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }))
  }

  function pause() {
    setState((prev) => ({ ...prev, status: 'paused' }))
  }

  function resume() {
    setState((prev) => ({ ...prev, status: 'active' }))
  }

  function endSession() {
    setState((prev) => ({ ...prev, status: 'ended', sessionEndTime: Date.now() }))
  }

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    questions: state.questions,
    session: state.session,
    status: state.status,
    submitAnswer,
    advance,
    skip,
    goBack,
    pause,
    resume,
    endSession,
  }
}
