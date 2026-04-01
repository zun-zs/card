/**
 * GTO 德州扑克 AI 引擎
 *
 * 核心策略：
 *   翻前 — 基于 preflopRanges 表的频率化混合策略
 *   翻后 — MDF (Minimum Defense Frequency) + 极化范围 + 几何下注尺寸
 *   街道策略 — C-bet / Check-raise / Probe / Delayed C-bet
 *   难度 — 低级别增大偏离 GTO 的噪声，高级别接近纯 GTO
 */

import { calculateWinRate } from '../composables/useDeck.js'
import { classifyHand } from './handClassifier.js'
import { getPreflopFrequency, selectByFrequency } from './preflopRanges.js'
import { analyzeBoardTexture } from './boardTexture.js'
import { RangeTracker } from './rangeTracker.js'

// ── 难度配置 ─────────────────────────────────────────────
const DIFFICULTY_CONFIGS = {
  beginner: {
    name: '新手',
    simulationCount: 300,
    mistakeRate: 0.18,     // 随机偏离 GTO 的概率
    noiseAmplitude: 0.15,  // 决策噪声幅度
  },
  intermediate: {
    name: '中级',
    simulationCount: 700,
    mistakeRate: 0.09,
    noiseAmplitude: 0.08,
  },
  advanced: {
    name: '高级',
    simulationCount: 800,
    mistakeRate: 0.03,
    noiseAmplitude: 0.04,
  },
  expert: {
    name: '专家',
    simulationCount: 1200,
    mistakeRate: 0.01,
    noiseAmplitude: 0.02,
  },
}

// ── 对手建模 ─────────────────────────────────────────────
class OpponentModel {
  constructor() { this.reset() }

  reset() {
    this.totalHands = 0
    this.vpip = 0.5
    this.pfr = 0.2
    this.aggression = 1.0
    this.foldToBet = 0.5
    this.recentActions = []
  }

  updateModel(action, gameStage, _winRate, betSize, potSize) {
    this.totalHands++
    this.recentActions.push({ action, gameStage, betSize, potSize })
    if (this.recentActions.length > 30) this.recentActions.shift()
    this._calculateStats()
  }

  _calculateStats() {
    const recent = this.recentActions
    if (recent.length === 0) return

    const preflopActions = recent.filter(a => a.gameStage === 'preflop')
    if (preflopActions.length > 0) {
      this.vpip = preflopActions.filter(a => a.action !== 'fold').length / preflopActions.length
      this.pfr = preflopActions.filter(a => a.action === 'raise').length / preflopActions.length
    }

    const betActions = recent.filter(a => a.action === 'raise')
    if (betActions.length > 0) {
      const avg = betActions.reduce((s, a) => s + a.betSize / Math.max(a.potSize, 1), 0) / betActions.length
      this.aggression = Math.max(0.5, Math.min(2.0, avg))
    }

    const facing = recent.filter(a => a.action === 'fold' || a.action === 'call')
    this.foldToBet = facing.length > 0 ? facing.filter(a => a.action === 'fold').length / facing.length : 0.5
  }

  getTendencies() {
    return {
      isTight: this.vpip < 0.25,
      isLoose: this.vpip > 0.45,
      isAggressive: this.pfr > 0.15 && this.aggression > 1.2,
      isPassive: this.pfr < 0.08 && this.aggression < 0.8,
      foldsToPressure: this.foldToBet > 0.55,
    }
  }
}

// ── AI 引擎 ──────────────────────────────────────────────
export class AdvancedAIEngine {
  constructor(difficulty = 'intermediate') {
    this.difficulty = difficulty
    this.config = DIFFICULTY_CONFIGS[difficulty]
    this.opponentModel = new OpponentModel()
    this.rangeTracker = new RangeTracker()
    this.sessionStats = { handsPlayed: 0 }
    // 翻前进攻者标记（用于 C-bet 策略）
    this.preflopAggressor = null // 'ai' | 'player' | null
  }

  setDifficulty(difficulty) {
    if (DIFFICULTY_CONFIGS[difficulty]) {
      this.difficulty = difficulty
      this.config = DIFFICULTY_CONFIGS[difficulty]
    }
  }

  reset() {
    this.opponentModel.reset()
    this.rangeTracker.reset()
    this.sessionStats = { handsPlayed: 0 }
    this.preflopAggressor = null
  }

  // ── 公开 API（形态与旧版一致）──────────────────────────
  makeDecision(gameState) {
    const {
      opponentCards, communityCards, gameStage,
      pot, opponentChips, opponentBet, playerBet, minRaise,
    } = gameState

    const aiCards = opponentCards // AI 的手牌
    const aiChips = opponentChips
    const aiBet = opponentBet
    const callAmount = Math.max(0, playerBet - aiBet)

    // ── 翻前：基于范围表 ─────────────────────────────────
    if (gameStage === 'preflop') {
      return this._preflopDecision(aiCards, callAmount, pot, aiChips, minRaise, playerBet, aiBet)
    }

    // ── 翻后：MDF + 极化 + 几何下注 ────────────────────────
    return this._postflopDecision(aiCards, communityCards, gameStage, callAmount, pot, aiChips, minRaise, playerBet, aiBet)
  }

  updateOpponentModel(playerAction, gameStage, estimatedWinRate, betSize, potSize) {
    this.opponentModel.updateModel(playerAction, gameStage, estimatedWinRate, betSize, potSize)

    // 同步范围追踪
    if (this.rangeTracker.initialized) {
      this.rangeTracker.narrowRange(playerAction, gameStage, betSize, potSize)
    }

    // 记录翻前进攻者
    if (gameStage === 'preflop' && playerAction === 'raise') {
      this.preflopAggressor = 'player'
    }
  }

  calculateAIWinRate(opponentCards, communityCards, gameStage) {
    if (!opponentCards || opponentCards.length !== 2) {
      return { winRate: 0, tieRate: 0, loseRate: 0 }
    }
    return calculateWinRate(opponentCards, communityCards, gameStage, this.config.simulationCount)
  }

  getAIStats() {
    return {
      difficulty: this.config.name,
      opponentModel: this.opponentModel.getTendencies(),
      sessionStats: this.sessionStats,
      totalHands: this.opponentModel.totalHands,
    }
  }

  static getDifficultyLevels() {
    return Object.keys(DIFFICULTY_CONFIGS).map(key => ({ key, name: DIFFICULTY_CONFIGS[key].name }))
  }

  // ══════════════════════════════════════════════════════
  //                   翻 前 决 策
  // ══════════════════════════════════════════════════════

  _preflopDecision(aiCards, callAmount, pot, aiChips, minRaise, playerBet, aiBet) {
    const handName = classifyHand(aiCards[0], aiCards[1])

    // 判断场景
    let scenario, distribution
    if (callAmount === 0 && aiBet === 0 && playerBet === 0) {
      // AI 率先行动 (SB/按钮位 open)
      scenario = 'sbOpen'
      distribution = getPreflopFrequency(handName, scenario) // { open, fold }
    } else if (callAmount > 0 && playerBet <= pot * 0.5) {
      // 面对 open（BB 视角）
      scenario = 'bbVsOpen'
      distribution = getPreflopFrequency(handName, scenario) // { fold, call, threebet }
    } else {
      // 面对 3-bet（SB 视角）
      scenario = 'sbVs3Bet'
      distribution = getPreflopFrequency(handName, scenario) // { fold, call, fourbet }
    }

    // 应用难度噪声
    distribution = this._addNoise(distribution)

    // 掷骰子选择动作
    const chosen = selectByFrequency(distribution)

    return this._translatePreflopAction(chosen, scenario, callAmount, pot, aiChips, minRaise, distribution, handName)
  }

  _translatePreflopAction(chosen, scenario, callAmount, pot, aiChips, minRaise, distribution, handName) {
    let action, amount, reasoning

    const raiseSize = this._geometricBetSize(pot, aiChips, 3) // 翻前按 3 条街几何尺寸

    switch (chosen) {
      case 'open':
      case 'threebet':
      case 'fourbet': {
        if (aiChips >= minRaise) {
          action = 'raise'
          // open = 2.5bb ≈ pot, 3bet = ~3× open, 4bet = ~2.5× 3bet
          const multiplier = chosen === 'open' ? 1.0 : chosen === 'threebet' ? 1.2 : 1.5
          amount = Math.min(Math.max(minRaise, Math.floor(raiseSize * multiplier)), aiChips)
          reasoning = `GTO ${chosen} (${handName})`
          this.preflopAggressor = 'ai'
        } else {
          action = callAmount > 0 ? 'call' : 'check'
          amount = callAmount
          reasoning = '筹码不足以加注'
        }
        break
      }
      case 'call': {
        action = 'call'
        amount = callAmount
        reasoning = `GTO 跟注 (${handName})`
        break
      }
      default: { // fold
        if (callAmount === 0) {
          action = 'check'
          amount = 0
          reasoning = `GTO 过牌 (${handName})`
        } else {
          action = 'fold'
          amount = 0
          reasoning = `GTO 弃牌 (${handName})`
        }
      }
    }

    return {
      action,
      amount,
      reasoning,
      confidence: 0.8,
      debugInfo: {
        handName,
        scenario,
        distribution: this._fmtDistribution(distribution),
        chosen,
        street: 'preflop',
      },
    }
  }

  // ══════════════════════════════════════════════════════
  //                   翻 后 决 策
  // ══════════════════════════════════════════════════════

  _postflopDecision(aiCards, communityCards, gameStage, callAmount, pot, aiChips, minRaise, playerBet, aiBet) {
    // 1. 计算胜率
    const wrData = this.calculateAIWinRate(aiCards, communityCards, gameStage)
    const equity = wrData.winRate / 100 // 0-1

    // 2. 板面纹理
    const texture = analyzeBoardTexture(communityCards)

    // 3. 街道策略
    const streetStrategy = this._getStreetStrategy(gameStage, texture, callAmount > 0)

    // 4. 构建混合策略的动作分布
    const distribution = this._buildPostflopDistribution({
      equity, callAmount, pot, aiChips, minRaise,
      texture, streetStrategy, gameStage,
    })

    // 5. 应用难度噪声
    const noisyDist = this._addNoise(distribution)

    // 6. 选择动作
    const chosen = selectByFrequency(noisyDist)

    // 7. 确定金额
    return this._translatePostflopAction(chosen, callAmount, pot, aiChips, minRaise, equity, texture, streetStrategy, noisyDist, gameStage)
  }

  /**
   * 基于 MDF / 极化范围构建翻后动作分布
   */
  _buildPostflopDistribution({ equity, callAmount, pot, aiChips, minRaise, texture, streetStrategy, gameStage }) {
    const facingBet = callAmount > 0

    if (facingBet) {
      // ── 面对下注：按 MDF 防守 ──
      const mdf = 1 - callAmount / (callAmount + pot) // Minimum Defense Frequency
      const potOdds = callAmount / (callAmount + pot)

      if (equity >= 0.70) {
        // 超强牌：加注 / 跟注
        return { raise: 0.55, call: 0.40, fold: 0.05 }
      } else if (equity >= potOdds + 0.05) {
        // 有足够底池赔率跟注
        const raiseFreq = Math.max(0, (equity - 0.55) * 1.5) // 越强越多 raise
        const callFreq = Math.min(mdf, 1 - raiseFreq - 0.05)
        const foldFreq = Math.max(0, 1 - raiseFreq - callFreq)
        return { raise: raiseFreq, call: callFreq, fold: foldFreq }
      } else if (equity >= potOdds * 0.7) {
        // 边缘牌：偶尔跟注防守
        return { raise: 0.02, call: mdf * 0.4, fold: 1 - mdf * 0.4 - 0.02 }
      } else {
        // 垃圾牌：大多弃牌，保留小概率诈唬
        const bluffRaise = this._gtoBluffRatio(callAmount, pot) * 0.15
        return { raise: bluffRaise, call: 0.03, fold: 1 - bluffRaise - 0.03 }
      }
    } else {
      // ── 可以看牌或下注 ──
      const { cbetFreq, checkRaiseFreq, betSize: stratBetRatio } = streetStrategy

      if (equity >= 0.65) {
        // 最强手：价值下注为主
        return { raise: 0.70, check: 0.30 }
      } else if (equity >= 0.45) {
        // 中等牌力：混合下注/看牌
        const betFreq = cbetFreq * (equity / 0.65)
        return { raise: Math.min(betFreq, 0.65), check: Math.max(1 - betFreq, 0.35) }
      } else if (equity >= 0.25) {
        // 弱对子 / 听牌：偶尔下注
        const semiBluff = texture.straightDrawPossible || texture.flushDrawPossible ? 0.35 : 0.15
        return { raise: semiBluff, check: 1 - semiBluff }
      } else {
        // 空气牌：GTO 诈唬频率 ≈ bet/(bet+pot)
        const bluffFreq = this._gtoBluffRatio(Math.floor(pot * (stratBetRatio || 0.6)), pot)
        return { raise: Math.min(bluffFreq, 0.30), check: Math.max(1 - bluffFreq, 0.70) }
      }
    }
  }

  /**
   * 街道策略：根据阶段和板面纹理确定 C-bet / 探测下注策略
   */
  _getStreetStrategy(gameStage, texture, facingBet) {
    const isPreflopAggressor = this.preflopAggressor === 'ai'

    if (gameStage === 'flop') {
      if (isPreflopAggressor && !facingBet) {
        // C-bet 策略
        if (texture.type === 'dry') {
          return { name: 'C-bet 小注（干燥面）', cbetFreq: 0.75, checkRaiseFreq: 0, betSize: 0.33 }
        } else if (texture.type === 'wet' || texture.type === 'dynamic') {
          return { name: 'C-bet 大注（湿润面）', cbetFreq: 0.55, checkRaiseFreq: 0, betSize: 0.66 }
        } else if (texture.type === 'monotone') {
          return { name: 'C-bet 谨慎（同花面）', cbetFreq: 0.40, checkRaiseFreq: 0, betSize: 0.50 }
        } else {
          return { name: 'C-bet 中注', cbetFreq: 0.60, checkRaiseFreq: 0, betSize: 0.50 }
        }
      } else if (!isPreflopAggressor && facingBet) {
        // Check-raise 策略
        return { name: 'Check-raise 防守', cbetFreq: 0, checkRaiseFreq: 0.12, betSize: 0.75 }
      } else {
        return { name: '探测下注', cbetFreq: 0.35, checkRaiseFreq: 0.08, betSize: 0.50 }
      }
    } else if (gameStage === 'turn') {
      if (isPreflopAggressor) {
        if (texture.type === 'dry' || texture.type === 'paired') {
          return { name: '延续下注（转牌）', cbetFreq: 0.55, checkRaiseFreq: 0, betSize: 0.60 }
        } else {
          return { name: '选择性下注（转牌）', cbetFreq: 0.45, checkRaiseFreq: 0, betSize: 0.66 }
        }
      } else {
        return { name: '探测下注（转牌）', cbetFreq: 0.30, checkRaiseFreq: 0.06, betSize: 0.60 }
      }
    } else {
      // river
      return { name: '河牌极化', cbetFreq: 0.40, checkRaiseFreq: 0.04, betSize: 0.75 }
    }
  }

  _translatePostflopAction(chosen, callAmount, pot, aiChips, minRaise, equity, texture, streetStrategy, distribution, gameStage) {
    let action, amount, reasoning

    switch (chosen) {
      case 'raise': {
        if (aiChips >= minRaise) {
          action = 'raise'
          const streetsLeft = gameStage === 'flop' ? 3 : gameStage === 'turn' ? 2 : 1
          const geoSize = this._geometricBetSize(pot, aiChips, streetsLeft)
          const textureMultiplier = streetStrategy.betSize || 0.60
          amount = Math.min(
            Math.max(minRaise, Math.floor(pot * textureMultiplier)),
            Math.min(geoSize, aiChips),
          )
          reasoning = equity >= 0.45 ? `价值下注 (${streetStrategy.name})` : `诈唬下注 (${streetStrategy.name})`
        } else {
          action = callAmount > 0 ? 'call' : 'check'
          amount = callAmount
          reasoning = '筹码不足，改为跟注/看牌'
        }
        break
      }
      case 'call': {
        action = 'call'
        amount = callAmount
        reasoning = `GTO 跟注防守 (MDF)`
        break
      }
      case 'check': {
        action = 'check'
        amount = 0
        reasoning = `GTO 过牌 (${streetStrategy.name})`
        break
      }
      default: { // fold
        if (callAmount === 0) {
          action = 'check'
          amount = 0
          reasoning = 'GTO 过牌'
        } else {
          action = 'fold'
          amount = 0
          reasoning = 'GTO 弃牌 (MDF 不满足)'
        }
      }
    }

    return {
      action,
      amount,
      reasoning,
      confidence: Math.min(0.95, Math.abs(equity - 0.5) * 2),
      debugInfo: {
        winRate: Math.round(equity * 100),
        potOdds: callAmount > 0 ? Math.round((callAmount / (callAmount + pot)) * 100) : 0,
        mdf: callAmount > 0 ? Math.round((1 - callAmount / (callAmount + pot)) * 100) : 100,
        boardTexture: texture.type,
        streetStrategy: streetStrategy.name,
        distribution: this._fmtDistribution(distribution),
        street: gameStage,
      },
    }
  }

  // ══════════════════════════════════════════════════════
  //                   工 具 函 数
  // ══════════════════════════════════════════════════════

  /**
   * GTO 诈唬比 = betSize / (betSize + pot)
   * 使对手的 bluff-catch 变得无差别 (indifferent)
   */
  _gtoBluffRatio(betSize, pot) {
    if (betSize + pot <= 0) return 0
    return betSize / (betSize + pot)
  }

  /**
   * 几何下注尺寸：使 N 条街后恰好全压
   * geometricBet = pot × ( (effectiveStack / pot + 1)^(1/N) - 1 )
   */
  _geometricBetSize(pot, effectiveStack, streetsLeft) {
    if (pot <= 0 || effectiveStack <= 0 || streetsLeft <= 0) return 0
    const ratio = Math.pow(effectiveStack / pot + 1, 1 / streetsLeft) - 1
    return Math.max(1, Math.floor(pot * ratio))
  }

  /**
   * 给动作分布加噪声（低难度噪声更大）
   */
  _addNoise(dist) {
    const { mistakeRate, noiseAmplitude } = this.config
    const noisy = { ...dist }

    // 随机失误：低级别 AI 偶尔会做出完全随机的决策
    if (Math.random() < mistakeRate) {
      const keys = Object.keys(noisy)
      const randomAction = keys[Math.floor(Math.random() * keys.length)]
      // 把大量概率转移到随机动作上
      for (const k of keys) noisy[k] *= 0.3
      noisy[randomAction] += 0.7
    }

    // 连续噪声：给每个概率加小扰动
    const keys = Object.keys(noisy)
    for (const k of keys) {
      noisy[k] += (Math.random() - 0.5) * noiseAmplitude
      noisy[k] = Math.max(0, noisy[k])
    }

    // 归一化
    const total = Object.values(noisy).reduce((a, b) => a + b, 0)
    if (total > 0) {
      for (const k of keys) noisy[k] /= total
    }

    return noisy
  }

  /**
   * 格式化分布用于 debugInfo
   */
  _fmtDistribution(dist) {
    const result = {}
    for (const [k, v] of Object.entries(dist)) {
      result[k] = Math.round(v * 100)
    }
    return result
  }
}

// 导出默认实例
export const aiEngine = new AdvancedAIEngine()

// 导出难度配置
export { DIFFICULTY_CONFIGS }