import rawQuestions from '../data/questions.json'

export interface Question {
  id: string
  subject: string
  question: string
  options: { A: string; B: string; C: string; D: string }
  correctOption: 'A' | 'B' | 'C' | 'D'
}

export function loadQuestions(): Question[] {
  const copy = [...rawQuestions] as Question[]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
