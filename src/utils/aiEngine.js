/**
 * 高级AI引擎 - 基于GTO理论的德州扑克AI
 * 包含对手建模、多难度级别、动态策略调整等功能
 */

import { calculateWinRate } from './cardUtils.js'

// AI难度级别配置
const DIFFICULTY_CONFIGS = {
  beginner: {
    name: '新手',
    simulationCount: 300,
    bluffFrequency: 0.05,
    aggressionFactor: 0.7,
    adaptationRate: 0.1,
    mistakeRate: 0.15,
    callThresholdBase: 0.35,
    raiseThresholdBase: 0.7
  },
  intermediate: {
    name: '中级',
    simulationCount: 700,
    bluffFrequency: 0.18,
    aggressionFactor: 0.9,
    adaptationRate: 0.3,
    mistakeRate: 0.08,
    callThresholdBase: 0.24,
    raiseThresholdBase: 0.60
  },
  advanced: {
    name: '高级',
    simulationCount: 800,
    bluffFrequency: 0.25,
    aggressionFactor: 1.1,
    adaptationRate: 0.5,
    mistakeRate: 0.03,
    callThresholdBase: 0.25,
    raiseThresholdBase: 0.6
  },
  expert: {
    name: '专家',
    simulationCount: 1200,
    bluffFrequency: 0.3,
    aggressionFactor: 1.2,
    adaptationRate: 0.7,
    mistakeRate: 0.01,
    callThresholdBase: 0.22,
    raiseThresholdBase: 0.58
  }
}

// 对手建模类
class OpponentModel {
  constructor() {
    this.reset()
  }

  reset() {
    this.totalHands = 0
    this.vpip = 0 // 主动入池率
    this.pfr = 0 // 翻牌前加注率
    this.aggression = 1.0 // 激进度
    this.foldToBet = 0.5 // 面对下注的弃牌率
    this.bluffFrequency = 0.1 // 诈唬频率
    this.showdownWinRate = 0.5 // 摊牌胜率
    this.actions = [] // 行动历史
    this.recentActions = [] // 最近20手的行动
  }

  // 更新对手模型
  updateModel(action, gameStage, winRate, betSize, potSize) {
    this.totalHands++
    this.actions.push({ action, gameStage, winRate, betSize, potSize, timestamp: Date.now() })
    
    // 保持最近行动记录在合理范围内
    this.recentActions.push({ action, gameStage, winRate, betSize, potSize })
    if (this.recentActions.length > 20) {
      this.recentActions.shift()
    }

    this._calculateStats()
  }

  _calculateStats() {
    if (this.recentActions.length === 0) return

    const recent = this.recentActions
    const preflopActions = recent.filter(a => a.gameStage === 'preflop')
    
    // 计算VPIP (主动入池率)
    const voluntaryActions = preflopActions.filter(a => a.action !== 'fold')
    this.vpip = preflopActions.length > 0 ? voluntaryActions.length / preflopActions.length : 0.5

    // 计算PFR (翻牌前加注率)
    const raiseActions = preflopActions.filter(a => a.action === 'raise')
    this.pfr = preflopActions.length > 0 ? raiseActions.length / preflopActions.length : 0.2

    // 计算激进度 (下注/加注的平均大小)
    const betActions = recent.filter(a => a.action === 'raise' || a.action === 'bet')
    if (betActions.length > 0) {
      const avgBetRatio = betActions.reduce((sum, a) => sum + (a.betSize / a.potSize), 0) / betActions.length
      this.aggression = Math.max(0.5, Math.min(2.0, avgBetRatio))
    }

    // 计算面对下注的弃牌率
    const facingBets = recent.filter(a => a.action === 'fold' || a.action === 'call')
    const folds = facingBets.filter(a => a.action === 'fold')
    this.foldToBet = facingBets.length > 0 ? folds.length / facingBets.length : 0.5
  }

  // 获取对手倾向性
  getTendencies() {
    return {
      isTight: this.vpip < 0.2,
      isLoose: this.vpip > 0.4,
      isAggressive: this.pfr > 0.15 && this.aggression > 1.2,
      isPassive: this.pfr < 0.08 && this.aggression < 0.8,
      isBluffHeavy: this.bluffFrequency > 0.2,
      foldsToPressure: this.foldToBet > 0.6
    }
  }
}

// 高级AI引擎类
export class AdvancedAIEngine {
  constructor(difficulty = 'intermediate') {
    this.difficulty = difficulty
    this.config = DIFFICULTY_CONFIGS[difficulty]
    this.opponentModel = new OpponentModel()
    this.gameHistory = []
    this.sessionStats = {
      handsPlayed: 0,
      winRate: 0.5,
      profitLoss: 0
    }
  }

  // 设置难度
  setDifficulty(difficulty) {
    if (DIFFICULTY_CONFIGS[difficulty]) {
      this.difficulty = difficulty
      this.config = DIFFICULTY_CONFIGS[difficulty]
    }
  }

  // 重置AI状态
  reset() {
    this.opponentModel.reset()
    this.gameHistory = []
    this.sessionStats = {
      handsPlayed: 0,
      winRate: 0.5,
      profitLoss: 0
    }
  }

  // 计算AI胜率（优化版本）
  calculateAIWinRate(opponentCards, communityCards, gameStage) {
    if (!opponentCards || opponentCards.length !== 2) {
      return { winRate: 0, tieRate: 0, loseRate: 0 }
    }

    return calculateWinRate(
      opponentCards, 
      communityCards, 
      gameStage, 
      this.config.simulationCount
    )
  }

  // 高级GTO决策算法
  makeDecision(gameState) {
    const {
      opponentCards,
      communityCards,
      gameStage,
      pot,
      opponentChips,
      opponentBet,
      playerBet,
      callAmount
    } = gameState

    // 计算基础数据
    const winRateData = this.calculateAIWinRate(opponentCards, communityCards, gameStage)
    const winRate = winRateData.winRate / 100
    const actualCallAmount = Math.max(0, playerBet - opponentBet)
    const totalPotAfterCall = pot + actualCallAmount
    const potOdds = actualCallAmount > 0 ? actualCallAmount / totalPotAfterCall : 0

    // 获取对手模型数据
    const opponentTendencies = this.opponentModel.getTendencies()
    
    // 计算各种因素
    const factors = this._calculateDecisionFactors({
      winRate,
      potOdds,
      gameStage,
      aiChips: opponentChips,
      pot,
      callAmount: actualCallAmount,
      opponentTendencies
    })

    // 应用难度调整
    const adjustedFactors = this._applyDifficultyAdjustments(factors)

    // 做出最终决策
    const decision = this._makeOptimalDecision(adjustedFactors, gameState)

    // 更新内部状态
    this._updateInternalState(decision, gameState)

    return decision
  }

  // 计算决策因素
  _calculateDecisionFactors({ winRate, potOdds, gameStage, aiChips, pot, callAmount, opponentTendencies }) {
    // 基础期望值
    const expectedValue = (winRate * (pot + callAmount)) - callAmount

    // 位置因素（简化：AI总是后位）
    const positionFactor = 1.05

    // 游戏阶段因素
    const stageFactor = {
      'preflop': 0.85,
      'flop': 1.0,
      'turn': 1.1,
      'river': 1.2
    }[gameStage] || 1.0

    // 栈深度因素
    const stackToPotRatio = aiChips / Math.max(pot, 1)
    const stackFactor = stackToPotRatio > 15 ? 1.15 : 
                       stackToPotRatio > 8 ? 1.05 : 
                       stackToPotRatio > 3 ? 1.0 : 0.9

    // 对手适应性因素
    let opponentFactor = 1.0
    if (opponentTendencies.isTight && opponentTendencies.isPassive) {
      opponentFactor = 1.1 // 对紧弱对手更激进
    } else if (opponentTendencies.isLoose && opponentTendencies.isAggressive) {
      opponentFactor = 0.95 // 对松凶对手更谨慎
    } else if (opponentTendencies.foldsToPressure) {
      opponentFactor = 1.08 // 对容易弃牌的对手增加诈唬
    }

    // 诈唬计算
    const baseBluffFreq = this.config.bluffFrequency
    const bluffFrequency = Math.min(0.4, baseBluffFreq * (1 + potOdds) * opponentFactor)
    const shouldBluff = Math.random() < bluffFrequency && winRate < 0.35

    // 调整后的胜率
    let adjustedWinRate = winRate * positionFactor * stageFactor * stackFactor * opponentFactor
    
    if (shouldBluff) {
      adjustedWinRate = Math.min(0.75, adjustedWinRate + 0.3)
    }

    // 添加适度随机性
    const randomFactor = (Math.random() - 0.5) * 0.06
    const finalWinRate = Math.max(0.05, Math.min(0.95, adjustedWinRate + randomFactor))

    // 计算决策阈值
    const callThreshold = Math.max(potOdds * 0.9, this.config.callThresholdBase)
    const raiseThreshold = this.config.raiseThresholdBase

    // 凯利公式计算最优下注
    const kellyFraction = Math.max(0, (finalWinRate * 2 - 1) * 0.4)
    const optimalBetSize = kellyFraction * aiChips

    return {
      winRate: finalWinRate,
      expectedValue,
      potOdds,
      shouldBluff,
      callThreshold,
      raiseThreshold,
      optimalBetSize,
      opponentFactor,
      stackFactor
    }
  }

  // 应用难度调整
  _applyDifficultyAdjustments(factors) {
    const config = this.config
    
    // 根据难度添加错误
    if (Math.random() < config.mistakeRate) {
      factors.winRate *= (0.8 + Math.random() * 0.4) // 错误估计胜率
      factors.expectedValue *= (0.7 + Math.random() * 0.6) // 错误估计期望值
    }

    // 激进度调整逻辑：激进度越高，阈值越低（更容易加注/跟注）
    // aggressionFactor范围0.7-1.2，调整范围应该是0.85-1.15
    const aggressionMultiplier = 2.0 - config.aggressionFactor // 1.3到0.8
    factors.raiseThreshold *= aggressionMultiplier
    factors.callThreshold *= aggressionMultiplier

    return factors
  }

  // 做出最优决策
  _makeOptimalDecision(factors, gameState) {
    const { opponentChips: aiChips, opponentBet, playerBet, minRaise, pot } = gameState
    const aiBet = opponentBet // AI就是opponent
    const callAmount = Math.max(0, playerBet - aiBet)
    
    let action = 'fold'
    let amount = 0
    let reasoning = ''

    // 决策逻辑
    if (aiBet < playerBet) {
      // 需要跟注或弃牌
      if (factors.winRate > factors.callThreshold && factors.expectedValue > -callAmount * 0.25) {
        action = 'call'
        amount = callAmount
        reasoning = factors.shouldBluff ? '诈唬跟注' : '价值跟注'
      } else {
        action = 'fold'
        reasoning = '胜率不足，选择弃牌'
      }
    } else {
      // 可以看牌或加注
      if (factors.winRate > factors.raiseThreshold || factors.shouldBluff) {
        console.log('aiChips', aiChips)
        if (aiChips >= minRaise) {
          action = 'raise'
          
          // 计算加注大小（相对于当前下注的增量）
          let baseBetSize = Math.floor(pot * (factors.shouldBluff ? 0.8 : 0.6))
          let raiseSize = Math.max(
            minRaise,
            Math.min(
              Math.floor(factors.optimalBetSize),
              baseBetSize
            )
          )
          
          // 确保加注金额不超过可用筹码
          const maxRaiseSize = aiChips // AI的剩余筹码就是最大可加注金额
          raiseSize = Math.min(raiseSize, maxRaiseSize)
          amount = Math.floor(raiseSize)  // 返回加注增量，确保为整数
          reasoning = factors.shouldBluff ? '诈唬加注' : '价值加注'
        } else {
          action = 'check'
          reasoning = '筹码不足，选择看牌'
        }
      } else {
        action = 'check'
        reasoning = '胜率一般，选择看牌'
      }
    }

    return {
      action,
      amount,
      reasoning,
      confidence: Math.min(0.95, Math.abs(factors.winRate - 0.5) * 2),
      debugInfo: {
        winRate: Math.round(factors.winRate * 100),
        expectedValue: Math.round(factors.expectedValue),
        potOdds: Math.round(factors.potOdds * 100),
        shouldBluff: factors.shouldBluff,
        callThreshold: Math.round(factors.callThreshold * 100),
        raiseThreshold: Math.round(factors.raiseThreshold * 100),
        optimalBetSize: Math.round(factors.optimalBetSize)
      }
    }
  }

  // 更新内部状态
  _updateInternalState(decision, gameState) {
    // 更新对手模型（这里需要玩家的行动数据）
    // 在实际游戏中会通过 updateOpponentModel 方法调用
    
    // 更新会话统计
    this.sessionStats.handsPlayed++
  }

  // 更新对手模型
  updateOpponentModel(playerAction, gameStage, estimatedWinRate, betSize, potSize) {
    this.opponentModel.updateModel(playerAction, gameStage, estimatedWinRate, betSize, potSize)
  }

  // 获取AI统计信息
  getAIStats() {
    return {
      difficulty: this.config.name,
      opponentModel: this.opponentModel.getTendencies(),
      sessionStats: this.sessionStats,
      totalHands: this.opponentModel.totalHands
    }
  }

  // 获取可用难度级别
  static getDifficultyLevels() {
    return Object.keys(DIFFICULTY_CONFIGS).map(key => ({
      key,
      name: DIFFICULTY_CONFIGS[key].name
    }))
  }
}

// 导出默认实例
export const aiEngine = new AdvancedAIEngine()

// 导出难度配置
export { DIFFICULTY_CONFIGS }