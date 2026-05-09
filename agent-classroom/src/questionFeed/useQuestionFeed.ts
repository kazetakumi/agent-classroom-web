import { useState } from 'react'
import { loadQuestions } from '../questionBank/questionBank'
import type { Question } from '../questionBank/questionBank'

export interface SessionRecord {
  questionId: string
  selectedOption: string
}

export interface SessionSummary {
  correct: number
  wrong: number
  skipped: number
  totalAttempted: number
  durationSeconds: number
}

interface FeedState {
  questions: Question[]
  currentIndex: number
  session: SessionRecord[]
  status: 'idle' | 'active' | 'paused' | 'ended'
  sessionStartTime: number | null
  sessionEndTime: number | null
  summary: SessionSummary | null
}

const IDLE_STATE: FeedState = {
  questions: [],
  currentIndex: 0,
  session: [],
  status: 'idle',
  sessionStartTime: null,
  sessionEndTime: null,
  summary: null,
}

function nextStateWithAdvance(prev: FeedState): FeedState {
  const nextIndex = prev.currentIndex + 1
  if (nextIndex > prev.questions.length - 1) {
    return { ...prev, questions: loadQuestions(), currentIndex: 0 }
  }
  return { ...prev, currentIndex: nextIndex }
}

function computeSummary(
  questions: Question[],
  session: SessionRecord[],
  sessionStartTime: number | null,
  endTime: number,
): SessionSummary {
  const questionMap = new Map(questions.map((q) => [q.id, q]))
  // Deduplicate by questionId — last record for a revisited question wins
  const recordMap = new Map(session.map((r) => [r.questionId, r]))
  let correct = 0
  let wrong = 0
  let skipped = 0
  for (const record of recordMap.values()) {
    if (record.selectedOption === 'skipped') {
      skipped++
    } else {
      const question = questionMap.get(record.questionId)
      if (question && record.selectedOption === question.correctOption) correct++
      else wrong++
    }
  }
  const durationSeconds = sessionStartTime
    ? Math.round((endTime - sessionStartTime) / 1000)
    : 0
  return { correct, wrong, skipped, totalAttempted: recordMap.size, durationSeconds }
}

export function useQuestionFeed() {
  const [state, setState] = useState<FeedState>(IDLE_STATE)

  const currentQuestion = state.questions[state.currentIndex]

  function startSession() {
    setState({ ...IDLE_STATE, questions: loadQuestions(), status: 'active' })
  }

  function startAgain() {
    setState({ ...IDLE_STATE, questions: loadQuestions(), status: 'active' })
  }

  function returnToIdle() {
    setState(IDLE_STATE)
  }

  function submitAnswer(selectedOption: string) {
    if (state.status !== 'active') return
    setState((prev) => ({
      ...prev,
      sessionStartTime: prev.sessionStartTime ?? Date.now(),
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
      return nextStateWithAdvance({
        ...prev,
        sessionStartTime: prev.sessionStartTime ?? Date.now(),
        session: [...prev.session, record],
      })
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
    setState((prev) => {
      const endTime = Date.now()
      const summary = computeSummary(prev.questions, prev.session, prev.sessionStartTime, endTime)
      return { ...prev, status: 'ended', sessionEndTime: endTime, summary }
    })
  }

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    questions: state.questions,
    session: state.session,
    status: state.status,
    summary: state.summary,
    startSession,
    startAgain,
    returnToIdle,
    submitAnswer,
    advance,
    skip,
    goBack,
    pause,
    resume,
    endSession,
  }
}
