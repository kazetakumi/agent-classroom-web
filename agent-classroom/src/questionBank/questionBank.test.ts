import { describe, it, expect } from 'vitest'
import { loadQuestions } from './questionBank'

describe('loadQuestions', () => {
  it('shuffle produces a different order than the original at least 9 out of 10 runs', () => {
    const first = loadQuestions()
    const originalIds = first.map((q) => q.id)
    let differentCount = 0
    for (let i = 0; i < 10; i++) {
      const shuffled = loadQuestions()
      const shuffledIds = shuffled.map((q) => q.id)
      const isDifferent = shuffledIds.some((id, idx) => id !== originalIds[idx])
      if (isDifferent) differentCount++
    }
    expect(differentCount).toBeGreaterThanOrEqual(9)
  })

  it('returns the same count as the source data (at least 15)', () => {
    const questions = loadQuestions()
    expect(questions.length).toBeGreaterThanOrEqual(15)
    expect(questions.length).toBe(loadQuestions().length)
  })

  it('each question has the required fields', () => {
    const questions = loadQuestions()
    for (const q of questions) {
      expect(q).toHaveProperty('id')
      expect(q).toHaveProperty('subject')
      expect(q).toHaveProperty('question')
      expect(q).toHaveProperty('options')
      expect(q).toHaveProperty('correctOption')
      expect(q.options).toHaveProperty('A')
      expect(q.options).toHaveProperty('B')
      expect(q.options).toHaveProperty('C')
      expect(q.options).toHaveProperty('D')
    }
  })
})
