import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuestionFeed } from './useQuestionFeed'
import type { Question } from '../questionBank/questionBank'

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
})
