import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuestionFeed } from './useQuestionFeed'
import type { Question } from '../questionBank/questionBank'

vi.mock('../questionBank/questionBank', () => ({
  loadQuestions: vi.fn(),
}))

import { loadQuestions } from '../questionBank/questionBank'

const mockQuestions: Question[] = [
  {
    id: 'q001',
    subject: 'Math',
    question: 'Q1?',
    options: { A: 'A1', B: 'B1', C: 'C1', D: 'D1' },
    correctOption: 'A',
  },
  {
    id: 'q002',
    subject: 'Math',
    question: 'Q2?',
    options: { A: 'A2', B: 'B2', C: 'C2', D: 'D2' },
    correctOption: 'B',
  },
  {
    id: 'q003',
    subject: 'Math',
    question: 'Q3?',
    options: { A: 'A3', B: 'B3', C: 'C3', D: 'D3' },
    correctOption: 'C',
  },
]

beforeEach(() => {
  vi.mocked(loadQuestions).mockReturnValue([...mockQuestions])
})

describe('useQuestionFeed', () => {
  it('starts in idle status', () => {
    const { result } = renderHook(() => useQuestionFeed())
    expect(result.current.status).toBe('idle')
  })

  it('startSession() transitions to active and loads questions', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    expect(result.current.status).toBe('active')
    expect(result.current.questions).toHaveLength(3)
  })

  it('currentIndex increments by 1 after advance() is called', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    expect(result.current.currentIndex).toBe(0)
    act(() => { result.current.advance() })
    expect(result.current.currentIndex).toBe(1)
  })

  it('submitAnswer appends a SessionRecord with the correct questionId and selectedOption', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.submitAnswer('A') })
    expect(result.current.session).toHaveLength(1)
    expect(result.current.session[0]).toEqual({ questionId: 'q001', selectedOption: 'A' })
  })

  it('session accumulates one entry per answered question across multiple advances', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.submitAnswer('A') })
    act(() => { result.current.advance() })
    act(() => { result.current.submitAnswer('B') })
    act(() => { result.current.advance() })
    act(() => { result.current.submitAnswer('C') })

    expect(result.current.session).toHaveLength(3)
    expect(result.current.session[0]).toEqual({ questionId: 'q001', selectedOption: 'A' })
    expect(result.current.session[1]).toEqual({ questionId: 'q002', selectedOption: 'B' })
    expect(result.current.session[2]).toEqual({ questionId: 'q003', selectedOption: 'C' })
  })

  it('skip() records "skipped" for the current question and increments the index', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.skip() })
    expect(result.current.session).toHaveLength(1)
    expect(result.current.session[0]).toEqual({ questionId: 'q001', selectedOption: 'skipped' })
    expect(result.current.currentIndex).toBe(1)
  })

  it('goBack() decrements the index by 1', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.advance() })
    expect(result.current.currentIndex).toBe(1)
    act(() => { result.current.goBack() })
    expect(result.current.currentIndex).toBe(0)
  })

  it('goBack() at index 0 stays at 0 and does not go negative', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    expect(result.current.currentIndex).toBe(0)
    act(() => { result.current.goBack() })
    expect(result.current.currentIndex).toBe(0)
  })

  it('pause() sets status to paused', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    expect(result.current.status).toBe('active')
    act(() => { result.current.pause() })
    expect(result.current.status).toBe('paused')
  })

  it('resume() sets status back to active', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.pause() })
    expect(result.current.status).toBe('paused')
    act(() => { result.current.resume() })
    expect(result.current.status).toBe('active')
  })

  it('skip() is a no-op when status is paused', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.pause() })
    act(() => { result.current.skip() })
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.session).toHaveLength(0)
  })

  it('endSession() sets status to ended', () => {
    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.endSession() })
    expect(result.current.status).toBe('ended')
  })

  it('advancing past the last question wraps to index 0 with re-shuffled questions', () => {
    const reshuffled: Question[] = [
      { id: 'q003', subject: 'Math', question: 'Q3?', options: { A: 'A3', B: 'B3', C: 'C3', D: 'D3' }, correctOption: 'C' },
      { id: 'q001', subject: 'Math', question: 'Q1?', options: { A: 'A1', B: 'B1', C: 'C1', D: 'D1' }, correctOption: 'A' },
      { id: 'q002', subject: 'Math', question: 'Q2?', options: { A: 'A2', B: 'B2', C: 'C2', D: 'D2' }, correctOption: 'B' },
    ]
    // First call for startSession, second call for the wrap-around reshuffle
    vi.mocked(loadQuestions)
      .mockReturnValueOnce([...mockQuestions])
      .mockReturnValueOnce(reshuffled)

    const { result } = renderHook(() => useQuestionFeed())
    act(() => { result.current.startSession() })
    act(() => { result.current.advance() }) // 0 → 1
    act(() => { result.current.advance() }) // 1 → 2 (last)
    act(() => { result.current.advance() }) // 2 → wrap → 0

    expect(result.current.currentIndex).toBe(0)
    expect(result.current.questions).toHaveLength(3)
    expect(result.current.questions.map((q) => q.id)).toEqual(
      expect.arrayContaining(['q001', 'q002', 'q003'])
    )
    expect(result.current.currentQuestion.id).toBe('q003')
  })

  describe('session summary', () => {
    it('summary.correct counts SessionRecord entries where selectedOption === question.correctOption', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      // q001 correctOption is 'A' — answer correctly
      act(() => { result.current.submitAnswer('A') })
      act(() => { result.current.advance() })
      // q002 correctOption is 'B' — answer correctly
      act(() => { result.current.submitAnswer('B') })
      act(() => { result.current.advance() })
      // q003 correctOption is 'C' — answer incorrectly
      act(() => { result.current.submitAnswer('D') })
      act(() => { result.current.endSession() })

      expect(result.current.summary!.correct).toBe(2)
    })

    it('summary.wrong counts only incorrectly answered questions, not explicitly skipped ones', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      // q001 — answer wrongly
      act(() => { result.current.submitAnswer('B') })
      act(() => { result.current.advance() })
      // q002 — answer correctly
      act(() => { result.current.submitAnswer('B') })
      act(() => { result.current.advance() })
      // q003 — explicitly swiped past (skipped, not wrong)
      act(() => { result.current.skip() })
      act(() => { result.current.endSession() })

      expect(result.current.summary!.wrong).toBe(1)
    })

    it('summary.skipped counts only questions explicitly swiped past, not questions never reached', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      // Only answer q001 then end — q002 and q003 were never navigated to
      act(() => { result.current.submitAnswer('A') })
      act(() => { result.current.endSession() })

      expect(result.current.summary!.skipped).toBe(0)
    })

    it('summary.totalAttempted equals only the number of questions attended (answered or explicitly skipped)', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.submitAnswer('A') }) // correct
      act(() => { result.current.advance() })
      act(() => { result.current.submitAnswer('A') }) // wrong (q002 correctOption is B)
      act(() => { result.current.endSession() })     // q003 never reached — not counted

      const s = result.current.summary!
      expect(s.totalAttempted).toBe(s.correct + s.wrong + s.skipped)
      expect(s.totalAttempted).toBe(2)
    })

    it('ending a session immediately after starting shows all zeros, not full bank size', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })

      const s = result.current.summary!
      expect(s.totalAttempted).toBe(0)
      expect(s.correct).toBe(0)
      expect(s.wrong).toBe(0)
      expect(s.skipped).toBe(0)
    })

    it('endSession() from paused state produces a valid summary', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.submitAnswer('A') })
      act(() => { result.current.pause() })
      act(() => { result.current.endSession() })

      expect(result.current.status).toBe('ended')
      expect(result.current.summary).not.toBeNull()
    })
  })

  describe('ended view and explanation state', () => {
    it('view defaults to "summary" when a session ends', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      expect(result.current.view).toBe('summary')
    })

    it('selectedQuestionId defaults to null when a session ends', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      expect(result.current.selectedQuestionId).toBeNull()
    })

    it('openReview() sets view to "review"', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      act(() => { result.current.openReview() })
      expect(result.current.view).toBe('review')
    })

    it('openExplanation(id) sets view to "explanation" and selectedQuestionId to the given id', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      act(() => { result.current.openReview() })
      act(() => { result.current.openExplanation('q002') })
      expect(result.current.view).toBe('explanation')
      expect(result.current.selectedQuestionId).toBe('q002')
    })

    it('closeExplanation() sets view back to "review" and clears selectedQuestionId', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      act(() => { result.current.openReview() })
      act(() => { result.current.openExplanation('q001') })
      act(() => { result.current.closeExplanation() })
      expect(result.current.view).toBe('review')
      expect(result.current.selectedQuestionId).toBeNull()
    })

    it('startAgain() resets view to "summary" and selectedQuestionId to null', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      act(() => { result.current.openReview() })
      act(() => { result.current.openExplanation('q003') })
      act(() => { result.current.startAgain() })
      expect(result.current.view).toBe('summary')
      expect(result.current.selectedQuestionId).toBeNull()
    })

    it('returnToIdle() resets view to "summary" and selectedQuestionId to null', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.endSession() })
      act(() => { result.current.openReview() })
      act(() => { result.current.openExplanation('q001') })
      act(() => { result.current.returnToIdle() })
      expect(result.current.view).toBe('summary')
      expect(result.current.selectedQuestionId).toBeNull()
    })
  })

  describe('lifecycle transitions', () => {
    it('startAgain() from ended resets session, index, and summary and returns to active', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.submitAnswer('A') })
      act(() => { result.current.endSession() })

      expect(result.current.status).toBe('ended')

      act(() => { result.current.startAgain() })

      expect(result.current.status).toBe('active')
      expect(result.current.session).toHaveLength(0)
      expect(result.current.currentIndex).toBe(0)
      expect(result.current.summary).toBeNull()
    })

    it('returnToIdle() from ended resets to idle with empty session and no summary', () => {
      const { result } = renderHook(() => useQuestionFeed())
      act(() => { result.current.startSession() })
      act(() => { result.current.submitAnswer('A') })
      act(() => { result.current.endSession() })
      act(() => { result.current.returnToIdle() })

      expect(result.current.status).toBe('idle')
      expect(result.current.session).toHaveLength(0)
      expect(result.current.summary).toBeNull()
    })

    it('completes the full state machine loop: idle → active → ended → idle → active', () => {
      const { result } = renderHook(() => useQuestionFeed())
      expect(result.current.status).toBe('idle')

      act(() => { result.current.startSession() })
      expect(result.current.status).toBe('active')

      act(() => { result.current.endSession() })
      expect(result.current.status).toBe('ended')

      act(() => { result.current.returnToIdle() })
      expect(result.current.status).toBe('idle')

      act(() => { result.current.startSession() })
      expect(result.current.status).toBe('active')
    })
  })
})
