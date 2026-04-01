import { createGameState } from '../utils/gameState.js'
import { createGameLogic } from '../utils/gameLogic.js'
import { setOpponentAction } from '../utils/gameController.js'

let _singleton = null

export function useGame() {
  if (_singleton) return _singleton

  const gameState = createGameState()
  const gameLogic = createGameLogic(gameState)

  // 注册 opponentAction 到 gameController
  if (gameLogic && typeof gameLogic.opponentAction === 'function') {
    setOpponentAction(gameLogic.opponentAction)
  }

  const updateRaiseAmount = (amount) => {
    if (gameState && gameState.raiseAmount) {
      gameState.raiseAmount.value = parseInt(amount, 10)
    }
  }

  _singleton = { gameState, gameLogic, updateRaiseAmount }
  return _singleton
}

export default useGame
