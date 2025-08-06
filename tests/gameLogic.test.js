/**
 * 德州扑克游戏逻辑测试用例
 * 测试游戏的核心功能和边界情况
 */

// 在浏览器环境中，我们需要模拟这些模块
// 实际测试时会通过全局变量访问
let gameFinance, createGameState, createGameLogic, AdvancedAIEngine;

// 检查是否在浏览器环境中
if (typeof window !== 'undefined') {
  // 浏览器环境：从全局对象获取
  gameFinance = window.gameFinance;
  createGameState = window.createGameState;
  createGameLogic = window.createGameLogic;
  AdvancedAIEngine = window.AdvancedAIEngine;
} else {
  // Node.js环境：使用ES6导入
  const { gameFinance: gf } = await import('../src/utils/gameFinance.js');
  const { createGameState: cgs } = await import('../src/utils/gameState.js');
  const { createGameLogic: cgl } = await import('../src/utils/gameLogic.js');
  const { AdvancedAIEngine: aai } = await import('../src/utils/aiEngine.js');
  
  gameFinance = gf;
  createGameState = cgs;
  createGameLogic = cgl;
  AdvancedAIEngine = aai;
}

// 模拟测试框架
class TestRunner {
  constructor() {
    this.tests = []
    this.passed = 0
    this.failed = 0
  }

  test(name, fn) {
    this.tests.push({ name, fn })
  }

  async run() {
    console.log('🎮 开始德州扑克游戏逻辑测试\n')
    
    for (const { name, fn } of this.tests) {
      try {
        await fn()
        console.log(`✅ ${name}`)
        this.passed++
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`)
        this.failed++
      }
    }

    console.log(`\n📊 测试结果: ${this.passed} 通过, ${this.failed} 失败`)
    return this.failed === 0
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message)
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message}: 期望 ${expected}, 实际 ${actual}`)
    }
  }
}

const test = new TestRunner()

// 测试1: 游戏初始化
test.test('游戏初始化测试', () => {
  gameFinance.reset()
  const state = gameFinance.getState()
  
  test.assertEqual(state.playerChips, 1000, '玩家初始筹码应为1000')
  test.assertEqual(state.opponentChips, 1000, '对手初始筹码应为1000')
  test.assertEqual(state.pot, 0, '初始底池应为0')
  test.assertEqual(state.playerBet, 0, '玩家初始下注应为0')
  test.assertEqual(state.opponentBet, 0, '对手初始下注应为0')
})

// 测试2: 盲注收取
test.test('盲注收取测试 - 玩家大盲注', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  const state = gameFinance.getState()
  
  test.assertEqual(state.playerChips, 980, '玩家筹码应减少20(大盲注)')
  test.assertEqual(state.opponentChips, 990, '对手筹码应减少10(小盲注)')
  test.assertEqual(state.playerBet, 20, '玩家下注应为20')
  test.assertEqual(state.opponentBet, 10, '对手下注应为10')
  test.assertEqual(state.pot, 30, '底池应为30')
})

test.test('盲注收取测试 - 玩家小盲注', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('small')
  const state = gameFinance.getState()
  
  test.assertEqual(state.playerChips, 990, '玩家筹码应减少10(小盲注)')
  test.assertEqual(state.opponentChips, 980, '对手筹码应减少20(大盲注)')
  test.assertEqual(state.playerBet, 10, '玩家下注应为10')
  test.assertEqual(state.opponentBet, 20, '对手下注应为20')
  test.assertEqual(state.pot, 30, '底池应为30')
})

// 测试3: 看牌逻辑
test.test('翻牌前看牌逻辑测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big') // 玩家大盲注
  gameFinance.currentStage = 'preflop'
  
  // 玩家是大盲注，对手还没跟注，不能看牌
  test.assert(!gameFinance.canCheck('player'), '大盲注在对手未跟注时不能看牌')
  
  // 对手跟注后，玩家可以看牌
  gameFinance.opponentCall()
  test.assert(gameFinance.canCheck('player'), '对手跟注后大盲注可以看牌')
})

test.test('翻牌后看牌逻辑测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  gameFinance.advanceStage() // 进入翻牌阶段
  
  // 翻牌后双方下注为0，都可以看牌
  test.assert(gameFinance.canCheck('player'), '翻牌后玩家可以看牌')
  test.assert(gameFinance.canCheck('opponent'), '翻牌后对手可以看牌')
})

// 测试4: 跟注逻辑
test.test('跟注逻辑测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('small') // 玩家小盲注
  
  // 玩家需要跟注10才能与大盲注相等
  test.assertEqual(gameFinance.getCallAmount('player'), 10, '小盲注需要跟注10')
  test.assert(gameFinance.canCall('player'), '玩家应该可以跟注')
  
  const result = gameFinance.playerCall()
  test.assert(result.success, '跟注应该成功')
  
  const state = gameFinance.getState()
  test.assertEqual(state.playerBet, 20, '跟注后玩家下注应为20')
  test.assertEqual(state.playerChips, 980, '跟注后玩家筹码应为980')
  test.assertEqual(state.pot, 40, '跟注后底池应为40')
})

// 测试5: 加注逻辑
test.test('加注逻辑测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  
  // 玩家加注到40
  const result = gameFinance.playerRaise(40)
  test.assert(result.success, '加注应该成功')
  
  const state = gameFinance.getState()
  test.assertEqual(state.playerBet, 40, '加注后玩家下注应为40')
  test.assertEqual(state.playerChips, 960, '加注后玩家筹码应为960')
  test.assertEqual(state.pot, 50, '加注后底池应为50')
})

// 测试6: 阶段推进
test.test('阶段推进测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  
  // 模拟双方都跟注
  gameFinance.opponentCall()
  test.assert(gameFinance.canAdvanceStage(), '双方下注相等时应该可以推进阶段')
  
  const initialStage = gameFinance.currentStage
  gameFinance.advanceStage()
  
  const state = gameFinance.getState()
  test.assertEqual(state.playerBet, 0, '新阶段玩家下注应重置为0')
  test.assertEqual(state.opponentBet, 0, '新阶段对手下注应重置为0')
  test.assert(state.pot > 0, '底池应保持不变')
})

// 测试7: 底池分配
test.test('底池分配测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  
  const initialPlayerChips = gameFinance.playerChips
  const initialPot = gameFinance.pot
  
  // 玩家获胜
  gameFinance.distributePot('player')
  
  const state = gameFinance.getState()
  test.assertEqual(state.playerChips, initialPlayerChips + initialPot, '玩家应获得底池')
  test.assertEqual(state.pot, 0, '底池应被清空')
  test.assertEqual(state.playerBet, 0, '玩家下注应被重置')
  test.assertEqual(state.opponentBet, 0, '对手下注应被重置')
})

// 测试8: AI决策测试
test.test('AI决策基础测试', () => {
  const aiEngine = new AdvancedAIEngine('intermediate')
  
  const gameState = {
    aiCards: [{ suit: 'hearts', rank: 'A' }, { suit: 'spades', rank: 'K' }],
    communityCards: [],
    gameStage: 'preflop',
    pot: 30,
    aiChips: 980,
    aiBet: 10,
    playerBet: 20,
    minRaise: 20
  }
  
  const decision = aiEngine.makeDecision(gameState)
  
  test.assert(['fold', 'call', 'raise', 'check'].includes(decision.action), 'AI决策应返回有效行动')
  test.assert(typeof decision.confidence === 'number', 'AI决策应包含信心度')
  test.assert(typeof decision.reasoning === 'string', 'AI决策应包含推理')
})

// 测试9: 边界情况测试
test.test('筹码不足测试', () => {
  gameFinance.reset()
  gameFinance.setChips(15, 1000) // 玩家只有15筹码
  gameFinance.initializeNewHand('big')
  
  // 玩家筹码不足以支付大盲注，应该全下
  const state = gameFinance.getState()
  test.assert(state.playerChips >= 0, '玩家筹码不应为负数')
})

test.test('全下测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  
  // 玩家全下
  const allInAmount = gameFinance.playerChips + gameFinance.playerBet
  const result = gameFinance.playerRaise(allInAmount)
  
  test.assert(result.success, '全下应该成功')
  test.assertEqual(gameFinance.playerChips, 0, '全下后玩家筹码应为0')
})

// 测试10: 游戏状态一致性
test.test('游戏状态一致性测试', () => {
  gameFinance.reset()
  gameFinance.initializeNewHand('big')
  
  // 执行一系列操作
  gameFinance.playerRaise(40)
  gameFinance.opponentCall()
  gameFinance.advanceStage()
  
  const validation = gameFinance.validateState()
  test.assert(validation.isValid, `游戏状态应该有效: ${validation.errors.join(', ')}`)
})

// 测试11: 行动权测试
test.test('行动权测试', () => {
  gameFinance.reset()
  
  // 翻牌前：小盲注先行动
  gameFinance.initializeNewHand('big') // 玩家大盲注
  test.assertEqual(gameFinance.whoActsFirst('preflop'), 'opponent', '翻牌前对手(小盲注)应先行动')
  
  gameFinance.initializeNewHand('small') // 玩家小盲注
  test.assertEqual(gameFinance.whoActsFirst('preflop'), 'player', '翻牌前玩家(小盲注)应先行动')
  
  // 翻牌后：小盲注先行动
  test.assertEqual(gameFinance.whoActsFirst('flop'), 'player', '翻牌后玩家(小盲注)应先行动')
})

// 测试12: 完整游戏流程测试
test.test('完整游戏流程测试', () => {
  const gameState = createGameState()
  const gameLogic = createGameLogic(gameState)
  
  // 开始游戏
  gameLogic.startGame()
  test.assert(gameState.gameStarted.value, '游戏应该已开始')
  test.assert(gameState.playerCards.value.length === 2, '玩家应有2张手牌')
  test.assert(gameState.opponentCards.value.length === 2, '对手应有2张手牌')
  test.assertEqual(gameState.gameStage.value, 'preflop', '游戏阶段应为翻牌前')
})

// 运行所有测试
if (typeof window === 'undefined') {
  // Node.js环境
  test.run().then(success => {
    process.exit(success ? 0 : 1)
  })
} else {
  // 浏览器环境
  test.run()
}

export { test }