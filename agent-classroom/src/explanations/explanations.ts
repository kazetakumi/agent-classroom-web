import rawExplanations from '../data/explanations.json'

export interface Explanation {
  steps: string[]
}

export type ExplanationsMap = Record<string, Explanation>

export function loadExplanations(): ExplanationsMap {
  return rawExplanations as ExplanationsMap
}
