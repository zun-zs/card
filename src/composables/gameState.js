import { ref, computed } from 'vue'
import { gameFinance } from '../utils/gameFinance.js'
import { calculateWinRate, getHandStrength } from '../utils/cardUtils.js'

export function useGameState() {
  // 基础游戏状态
  const gameStarted = ref(false)
  const showdown = ref(false)
  const playerTurn = ref(true)
  const statusMessage = ref('轮到你行动')
  const gameStage = ref('preflop') // preflop, flop, turn, river, showdown
  
  // 牌局信息
  const deck = ref([])
  const communityCards = ref([])
  const playerCards = ref([])
  const opponentCards = ref([])
  
  // UI控制
  const raiseAmount = ref(20)
  const showGTODebug = ref(false)
  const gtoDebugInfo = ref({})
  
  // 计算属性 - 基于金融模块
  const financeState = computed(() => gameFinance.getState())
  
  const callAmount = computed(() => financeState.value.callAmount)
  const canCheck = computed(() => financeState.value.canCheck)
  const canCall = computed(() => financeState.value.canCall)
  const playerChips = computed(() => financeState.value.playerChips)
  const opponentChips = computed(() => financeState.value.opponentChips)
  const playerBet = computed(() => financeState.value.playerBet)
  const opponentBet = computed(() => financeState.value.opponentBet)
  const pot = computed(() => financeState.value.pot)
  const minRaise = computed(() => financeState.value.minRaise)
  
  // 胜率计算
  const playerWinRate = computed(() => {
    if (!gameStarted.value || !playerCards.value.length || showdown.value) {
      return { winRate: 0, tieRate: 0, loseRate: 0 }
    }
    return calculateWinRate(playerCards.value, communityCards.value, gameStage.value)
  })
  
  const handStrength = computed(() => {
    return getHandStrength(playerWinRate.value.winRate)
  })
  
  // 状态重置方法
  const resetGameState = () => {
    showdown.value = false
    playerTurn.value = true
    statusMessage.value = '轮到你行动'
    communityCards.value = []
    playerCards.value = []
    opponentCards.value = []
    gameStage.value = 'preflop'
    gtoDebugInfo.value = {}
  }
  
  // 游戏阶段推进
  const advanceStage = () => {
    gameFinance.advanceStage()
    
    switch (gameStage.value) {
      case 'preflop':
        gameStage.value = 'flop'
        statusMessage.value = '翻牌阶段'
        break
      case 'flop':
        gameStage.value = 'turn'
        statusMessage.value = '转牌阶段'
        break
      case 'turn':
        gameStage.value = 'river'
        statusMessage.value = '河牌阶段'
        break
      case 'river':
        gameStage.value = 'showdown'
        return true // 表示需要摊牌
    }
    
    playerTurn.value = true
    setTimeout(() => {
      statusMessage.value = '轮到你行动'
    }, 1000)
    
    return false
  }
  
  // 切换调试面板
  const toggleGTODebug = () => {
    showGTODebug.value = !showGTODebug.value
  }
  
  return {
    // 状态
    gameStarted,
    showdown,
    playerTurn,
    statusMessage,
    gameStage,
    deck,
    communityCards,
    playerCards,
    opponentCards,
    raiseAmount,
    showGTODebug,
    gtoDebugInfo,
    
    // 计算属性
    callAmount,
    canCheck,
    canCall,
    playerChips,
    opponentChips,
    playerBet,
    opponentBet,
    pot,
    minRaise,
    playerWinRate,
    handStrength,
    
    // 方法
    resetGameState,
    advanceStage,
    toggleGTODebug
  }
}