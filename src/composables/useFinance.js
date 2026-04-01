import { ref, computed } from 'vue'
import { gameFinance, BETTING_CONSTANTS, GameFinance } from '../utils/gameFinance.js'

// 内部触发器，供 gameFinance 调用以触发 UI 更新
const financeUpdateTrigger = ref(0)
const updateUI = () => {
  financeUpdateTrigger.value++
}

// 将 updateUI 暴露给底层单例
gameFinance.updateUI = updateUI

// 响应式的金融状态
export const financeState = computed(() => {
  // 依赖触发器以便在 gameFinance 调用 updateUI 时刷新
  financeUpdateTrigger.value
  return gameFinance.getState()
})

export function useFinance() {
  return {
    financeState,
    gameFinance,
    BETTING_CONSTANTS
  }
}

export { gameFinance, BETTING_CONSTANTS, GameFinance }
