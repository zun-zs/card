import { describe, it, expect, beforeEach } from 'vitest'
import { createGameState } from '../../src/utils/gameState.js'
import { createGameLogic } from '../../src/utils/gameLogic.js'
import { gameFinance } from '../../src/utils/gameFinance.js'

describe('gameLogic integration', () => {
  beforeEach(() => {
    gameFinance.reset()
  })

  it('完整游戏流程测试', () => {
    const gameState = createGameState()
    const gameLogic = createGameLogic(gameState)

    gameLogic.startGame()

    expect(gameState.gameStarted.value).toBe(true)
    expect(gameState.playerCards.value.length).toBe(2)
    expect(gameState.opponentCards.value.length).toBe(2)
    expect(gameState.gameStage.value).toBe('preflop')
  })
})
