/**
 * 范围追踪器 — 根据对手的翻前/翻后行动动态收窄其可能的手牌范围
 */

import { getSBOpenRange, BB_VS_OPEN, handNameToIndex } from './preflopRanges.js'

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

/**
 * 生成所有 1326 种两牌组合
 * @returns {Array<{cards: [{suit,rank},{suit,rank}], hand: string, weight: number}>}
 */
function generateAllCombos() {
  const deck = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }

  const combos = []
  for (let i = 0; i < deck.length; i++) {
    for (let j = i + 1; j < deck.length; j++) {
      const c1 = deck[i]
      const c2 = deck[j]
      // 简化的手牌分类
      const v1 = RANKS.indexOf(c1.rank) + 2
      const v2 = RANKS.indexOf(c2.rank) + 2
      const DISPLAY = { 10: 'T', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' }
      const ch1 = DISPLAY[v1] || String(v1)
      const ch2 = DISPLAY[v2] || String(v2)

      let hand
      if (v1 === v2) {
        hand = `${ch1}${ch2}`
      } else {
        const high = v1 > v2 ? ch1 : ch2
        const low = v1 > v2 ? ch2 : ch1
        const suffix = c1.suit === c2.suit ? 's' : 'o'
        hand = `${high}${low}${suffix}`
      }

      combos.push({ cards: [c1, c2], hand, weight: 1.0 })
    }
  }
  return combos
}

export class RangeTracker {
  constructor() {
    this.allCombos = generateAllCombos()
    this.range = [] // 当前对手范围
    this.initialized = false
  }

  /**
   * 用全范围初始化（对手尚未行动时的默认范围 = 全部 1326 组合）
   */
  initFullRange() {
    this.range = this.allCombos.map(c => ({ ...c, weight: 1.0 }))
    this.initialized = true
  }

  /**
   * 基于翻前动作初始化范围
   * @param {'open'|'call'|'threebet'} action — 对手的翻前动作
   * @param {'sb'|'bb'} position — 对手的位置
   */
  initFromPreflopAction(action, position) {
    if (position === 'sb' && action === 'open') {
      // 对手是 SB，做了 open — 用 SB_OPEN 表
      const openRange = getSBOpenRange() // [{hand, freq}]
      const freqMap = new Map(openRange.map(r => [r.hand, r.freq]))
      this.range = this.allCombos.map(c => ({
        ...c,
        weight: freqMap.get(c.hand) || 0
      })).filter(c => c.weight > 0)
    } else if (position === 'bb') {
      // 对手是 BB 面对 open
      this.range = this.allCombos.map(c => {
        const { row, col } = handNameToIndex(c.hand)
        const freqs = BB_VS_OPEN[row][col]
        let weight = 0
        if (action === 'call') weight = freqs[1]
        else if (action === 'threebet') weight = freqs[2]
        else weight = 1.0 // fallback
        return { ...c, weight }
      }).filter(c => c.weight > 0)
    } else {
      this.initFullRange()
    }
    this.initialized = true
  }

  /**
   * 根据对手的翻后行动收窄范围
   * @param {string} action — 'fold' / 'call' / 'raise' / 'check'
   * @param {string} street — 'flop' / 'turn' / 'river'
   * @param {number} betSize — 下注金额
   * @param {number} potSize — 底池大小
   */
  narrowRange(action, street, betSize, potSize) {
    if (!this.initialized || this.range.length === 0) return

    const betRatio = potSize > 0 ? betSize / potSize : 0

    switch (action) {
      case 'fold':
        // 对手弃牌 — 这局结束，范围重置
        break

      case 'call': {
        // 跟注 = 移除最强的一部分 (会 raise) + 移除最弱的 (会 fold)
        // 保留中间部分
        this._applyContinueFilter(0.15, 0.25 + betRatio * 0.15)
        break
      }

      case 'raise': {
        // 加注 = 保留 极强 + 一部分诈唬
        // 极化范围：保留顶部 + 底部一部分
        this._applyRaiseFilter(betRatio)
        break
      }

      case 'check': {
        // 看牌 = 移除最强的一部分 (会下注) + 保留中弱范围
        this._applyCheckFilter()
        break
      }
    }
  }

  /**
   * 跟注时的范围过滤：移除顶部和底部
   */
  _applyContinueFilter(topRemoveRatio, bottomRemoveRatio) {
    if (this.range.length === 0) return

    // 按权重排序（近似手牌强度）
    const sorted = [...this.range].sort((a, b) => b.weight - a.weight)
    const total = sorted.length
    const topCut = Math.floor(total * topRemoveRatio)
    const bottomCut = Math.floor(total * bottomRemoveRatio)

    // 降低顶部权重（它们会 raise）
    for (let i = 0; i < topCut; i++) {
      sorted[i].weight *= 0.3
    }
    // 降低底部权重（它们会 fold）
    for (let i = total - bottomCut; i < total; i++) {
      sorted[i].weight *= 0.2
    }

    this.range = sorted.filter(c => c.weight > 0.01)
  }

  /**
   * 加注时的范围过滤：保留极化区间
   */
  _applyRaiseFilter(betRatio) {
    if (this.range.length === 0) return

    const sorted = [...this.range].sort((a, b) => b.weight - a.weight)
    const total = sorted.length

    // GTO 诈唬比：bet / (bet + pot) ≈ betRatio / (1 + betRatio)
    const bluffRatio = betRatio / (1 + betRatio)
    const valueCount = Math.floor(total * 0.2) // 约 20% 是价值加注
    const bluffCount = Math.floor(valueCount * bluffRatio)

    for (let i = 0; i < total; i++) {
      if (i < valueCount) {
        // 顶部：价值部分 — 权重提高
        sorted[i].weight *= 1.5
      } else if (i >= total - bluffCount) {
        // 底部：诈唬部分 — 权重适中
        sorted[i].weight *= 0.8
      } else {
        // 中间部分大幅降权（不会 raise）
        sorted[i].weight *= 0.15
      }
    }

    this.range = sorted.filter(c => c.weight > 0.01)
  }

  /**
   * 看牌时的范围过滤：移除最强部分
   */
  _applyCheckFilter() {
    if (this.range.length === 0) return

    const sorted = [...this.range].sort((a, b) => b.weight - a.weight)
    const total = sorted.length
    const topCut = Math.floor(total * 0.25)

    for (let i = 0; i < topCut; i++) {
      sorted[i].weight *= 0.4
    }

    this.range = sorted.filter(c => c.weight > 0.01)
  }

  /**
   * 移除与已知牌冲突的组合
   * @param {Array<{suit,rank}>} knownCards
   */
  removeBlockedCombos(knownCards) {
    const blocked = new Set(knownCards.map(c => `${c.suit}-${c.rank}`))
    this.range = this.range.filter(combo => {
      const c1Key = `${combo.cards[0].suit}-${combo.cards[0].rank}`
      const c2Key = `${combo.cards[1].suit}-${combo.cards[1].rank}`
      return !blocked.has(c1Key) && !blocked.has(c2Key)
    })
  }

  /**
   * 获取当前范围
   * @returns {Array<{cards, hand, weight}>}
   */
  getRange() {
    return this.range
  }

  /**
   * 获取范围宽度（占全部 1326 组合的百分比）
   */
  getRangeWidth() {
    if (this.range.length === 0) return 0
    const totalWeight = this.range.reduce((sum, c) => sum + c.weight, 0)
    const maxWeight = this.allCombos.length // 1326 × weight 1.0
    return Math.round((totalWeight / maxWeight) * 100)
  }

  /**
   * 重置范围
   */
  reset() {
    this.range = []
    this.initialized = false
  }
}
