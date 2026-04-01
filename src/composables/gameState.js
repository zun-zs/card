import { createGameState } from '../utils/gameState.js'

// 轻量重导出：保留原 `useGameState` API，但复用 utils 中的实现，避免重复代码。
export function useGameState() {
  return createGameState()
}