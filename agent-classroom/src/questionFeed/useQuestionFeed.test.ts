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
  it('currentIndex increments by 1 after advance() is called', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    expect(result.current.currentIndex).toBe(0)
    act(() => { result.current.advance() })
    expect(result.current.currentIndex).toBe(1)
  })

  it('submitAnswer appends a SessionRecord with the correct questionId and selectedOption', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.submitAnswer('A') })
    expect(result.current.session).toHaveLength(1)
    expect(result.current.session[0]).toEqual({ questionId: 'q001', selectedOption: 'A' })
  })

  it('session accumulates one entry per answered question across multiple advances', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
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
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.skip() })
    expect(result.current.session).toHaveLength(1)
    expect(result.current.session[0]).toEqual({ questionId: 'q001', selectedOption: 'skipped' })
    expect(result.current.currentIndex).toBe(1)
  })

  it('goBack() decrements the index by 1', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.advance() })
    expect(result.current.currentIndex).toBe(1)
    act(() => { result.current.goBack() })
    expect(result.current.currentIndex).toBe(0)
  })

  it('goBack() at index 0 stays at 0 and does not go negative', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    expect(result.current.currentIndex).toBe(0)
    act(() => { result.current.goBack() })
    expect(result.current.currentIndex).toBe(0)
  })

  it('pause() sets status to paused', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    expect(result.current.status).toBe('active')
    act(() => { result.current.pause() })
    expect(result.current.status).toBe('paused')
  })

  it('resume() sets status back to active', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.pause() })
    expect(result.current.status).toBe('paused')
    act(() => { result.current.resume() })
    expect(result.current.status).toBe('active')
  })

  it('skip() is a no-op when status is paused', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.pause() })
    act(() => { result.current.skip() })
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.session).toHaveLength(0)
  })

  it('endSession() sets status to ended', () => {
    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
    act(() => { result.current.endSession() })
    expect(result.current.status).toBe('ended')
  })

  it('advancing past the last question wraps to index 0 with re-shuffled questions', () => {
    const reshuffled: Question[] = [
      { id: 'q003', subject: 'Math', question: 'Q3?', options: { A: 'A3', B: 'B3', C: 'C3', D: 'D3' }, correctOption: 'C' },
      { id: 'q001', subject: 'Math', question: 'Q1?', options: { A: 'A1', B: 'B1', C: 'C1', D: 'D1' }, correctOption: 'A' },
      { id: 'q002', subject: 'Math', question: 'Q2?', options: { A: 'A2', B: 'B2', C: 'C2', D: 'D2' }, correctOption: 'B' },
    ]
    vi.mocked(loadQuestions).mockReturnValueOnce(reshuffled)

    const { result } = renderHook(() => useQuestionFeed(mockQuestions))
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
})
