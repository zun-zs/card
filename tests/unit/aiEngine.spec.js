import { describe, it, expect } from 'vitest'
import { AdvancedAIEngine } from '../../src/utils/aiEngine.js'

describe('AdvancedAIEngine', () => {
  it('AI 决策返回有效结构', () => {
    const ai = new AdvancedAIEngine('intermediate')

    const gameState = {
      opponentCards: [{ suit: 'hearts', rank: 'A' }, { suit: 'spades', rank: 'K' }],
      communityCards: [],
      gameStage: 'preflop',
      pot: 30,
      opponentChips: 980,
      opponentBet: 10,
      playerBet: 20,
      minRaise: 20,
      callAmount: 10
    }

    const decision = ai.makeDecision(gameState)
    expect(['fold', 'call', 'raise', 'check']).toContain(decision.action)
    expect(typeof decision.confidence).toBe('number')
    expect(typeof decision.reasoning).toBe('string')
  })
})
