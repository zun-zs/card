import { ref, computed } from 'vue'
import { createDeck, shuffleDeck, dealCards, calculateWinRate, getHandStrength } from './cardUtils.js'
import { AdvancedAIEngine } from './aiEngine.js'
import { gameFinance } from './gameFinance.js'

export function createGameState() {
  // AI引擎初始化
  const aiEngine = new AdvancedAIEngine('intermediate')
  const aiDifficulty = ref('intermediate')
  const availableDifficulties = AdvancedAIEngine.getDifficultyLevels()

  // 游戏状态
  const gameStarted = ref(false)
  const showdown = ref(false)
  const playerTurn = ref(true)
  const statusMessage = ref('轮到你行动')
  const showOpponentCards = ref(false)

  // 牌局信息
  const deck = ref([])
  const communityCards = ref([])
  const playerCards = ref([])
  const opponentCards = ref([])

  // 游戏阶段
  const gameStage = ref('preflop') // preflop, flop, turn, river, showdown

  // 加注金额（UI控制）
  const raiseAmount = ref(20)

  // 响应式触发器 - 用于强制更新财务状态
  const financeUpdateTrigger = ref(0)

  // 强制更新财务状态的方法
  const updateFinanceState = () => {
    financeUpdateTrigger.value++
  }

  // 将更新方法暴露给gameFinance
  gameFinance.updateUI = updateFinanceState

  // 计算属性 - 基于金融模块
  const financeState = computed(() => {
    // 依赖触发器来强制重新计算
    financeUpdateTrigger.value
    return gameFinance.getState()
  })

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

  // GTO调试信息
  const showGTODebug = ref(false)
  const gtoDebugInfo = ref({})

  const toggleGTODebug = () => {
    console.log(showGTODebug.value)
    showGTODebug.value = !showGTODebug.value
  }

  // 重置游戏状态
  const resetGameState = (shouldCollectBlinds = true) => {
    showdown.value = false

    // 检查是否需要重置筹码
    const currentState = gameFinance.getState()
    if (currentState.playerChips <= 0 || currentState.opponentChips <= 0) {
      gameFinance.reset()
      aiEngine.reset()
    }

    // 轮换位置（每局交换大小盲注）
    const currentPosition = gameFinance.playerPosition
    const newPosition = currentPosition === 'big' ? 'small' : 'big'

    // 记录重置前的筹码总数用于验证
    const totalChipsBefore = gameFinance.playerChips + gameFinance.opponentChips + gameFinance.pot
    console.log('🔍 重置前筹码总数:', totalChipsBefore)

    // 初始化新一局，传递shouldCollectBlinds参数
    gameFinance.initializeNewHand(newPosition, shouldCollectBlinds)

    // 验证筹码守恒（只在收取盲注时检查）
    if (shouldCollectBlinds) {
      const totalChipsAfter = gameFinance.playerChips + gameFinance.opponentChips + gameFinance.pot
      console.log('🔍 重置后筹码总数:', totalChipsAfter)
      const expectedAfter = totalChipsBefore // 盲注收取不应改变总数
      if (totalChipsAfter !== expectedAfter) {
        console.error('⚠️ 重置时筹码总数不守恒！', { before: totalChipsBefore, after: totalChipsAfter, expected: expectedAfter })
      }
    }

    // 重置牌局
    deck.value = shuffleDeck(createDeck())
    playerCards.value = dealCards(deck.value, 2)
    opponentCards.value = dealCards(deck.value, 2)
    communityCards.value = []

    // 设置游戏阶段
    gameStage.value = 'preflop'
    raiseAmount.value = gameFinance.getValidRaiseRange('player').min

    // 设置初始行动权
    const whoActsFirst = gameFinance.whoActsFirst('preflop')
    playerTurn.value = whoActsFirst === 'player'

    if (playerTurn.value) {
      statusMessage.value = '轮到你行动'
    } else {
      statusMessage.value = '等待电脑行动'
      // 如果AI先行动，延迟触发AI行动
      setTimeout(() => {
        // 需要从外部传入opponentAction函数
        if (window.gameLogic && window.gameLogic.opponentAction) {
          window.gameLogic.opponentAction()
        }
      }, 1000)
    }

    // 清空调试信息
    gtoDebugInfo.value = {}
  }

  // 注意：advanceGameStage函数已移至gameLogic.js中统一管理

  return {
    // 基础状态
    gameStarted,
    playerCards,
    opponentCards,
    communityCards,
    deck,
    gameStage,
    playerTurn,
    showdown,
    showOpponentCards,
    statusMessage,
    raiseAmount,

    // AI相关
    aiEngine,
    aiDifficulty,
    availableDifficulties,

    // 计算属性
    playerChips,
    opponentChips,
    playerBet,
    opponentBet,
    pot,
    minRaise,
    callAmount,
    canCheck,
    canCall,
    playerWinRate,
    handStrength,

    // GTO调试
    showGTODebug,
    gtoDebugInfo,
    toggleGTODebug,

    // 方法
    resetGameState
  }
}
