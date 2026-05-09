import { describe, it, expect } from 'vitest'
import { loadExplanations } from './explanations'
import { loadQuestions } from '../questionBank/questionBank'

describe('explanations', () => {
  it('every question in the question bank has an explanation entry', () => {
    const questions = loadQuestions()
    const explanations = loadExplanations()
    for (const question of questions) {
      expect(explanations, `expected entry for question ${question.id}`).toHaveProperty(question.id)
    }
  })

  it('each explanation entry has at least two steps', () => {
    const explanations = loadExplanations()
    for (const [id, entry] of Object.entries(explanations)) {
      expect(Array.isArray(entry.steps), `${id} steps should be an array`).toBe(true)
      expect(entry.steps.length, `${id} should have at least 2 steps`).toBeGreaterThanOrEqual(2)
    }
  })

  it('every step is a non-empty string', () => {
    const explanations = loadExplanations()
    for (const [id, entry] of Object.entries(explanations)) {
      for (const step of entry.steps) {
        expect(typeof step, `${id} step should be a string`).toBe('string')
        expect(step.trim().length, `${id} step should not be empty`).toBeGreaterThan(0)
      }
    }
  })

  it('explanation count matches question bank count', () => {
    const questions = loadQuestions()
    const explanations = loadExplanations()
    expect(Object.keys(explanations).length).toBe(questions.length)
  })
})
