/**
 * 板面纹理分析器 — 根据公共牌结构判断板面类型
 * 影响 C-bet 频率和下注尺寸选择
 */

import { rankToValue } from './handClassifier.js'

/**
 * 分析公共牌的纹理特征
 * @param {Array<{suit: string, rank: string}>} communityCards
 * @returns {Object} 板面纹理描述
 */
export function analyzeBoardTexture(communityCards) {
  if (!communityCards || communityCards.length === 0) {
    return {
      type: 'unknown',
      flushDrawPossible: false,
      straightDrawPossible: false,
      highCard: 0,
      connectedness: 0,
      paired: false,
      monotone: false,
      twoTone: false,
      rainbow: false,
    }
  }

  const values = communityCards.map(c => rankToValue(c.rank)).sort((a, b) => b - a)
  const suits = communityCards.map(c => c.suit)
  const highCard = values[0]

  // 花色分析
  const suitCounts = {}
  for (const s of suits) suitCounts[s] = (suitCounts[s] || 0) + 1
  const maxSuitCount = Math.max(...Object.values(suitCounts))
  const monotone = maxSuitCount >= 3 && communityCards.length <= 3
  const twoTone = Object.keys(suitCounts).length === 2 && !monotone
  const rainbow = Object.keys(suitCounts).length >= 3

  // 对子检测
  const valueCounts = {}
  for (const v of values) valueCounts[v] = (valueCounts[v] || 0) + 1
  const paired = Object.values(valueCounts).some(c => c >= 2)

  // 同花听牌可能性 (≥2 张同花)
  const flushDrawPossible = maxSuitCount >= 2

  // 顺子听牌可能性
  const uniqueValues = [...new Set(values)].sort((a, b) => a - b)
  let straightDrawPossible = false
  let connectedness = 0

  if (uniqueValues.length >= 2) {
    // 检查连张情况
    let maxConsecutive = 1
    let currentConsecutive = 1
    let totalGaps = 0

    for (let i = 1; i < uniqueValues.length; i++) {
      const gap = uniqueValues[i] - uniqueValues[i - 1]
      totalGaps += gap - 1
      if (gap <= 2) {
        currentConsecutive++
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
      } else {
        currentConsecutive = 1
      }
    }

    // A 可以做低端顺子 (A-2-3-4-5)
    if (uniqueValues.includes(14) && uniqueValues.includes(2)) {
      maxConsecutive = Math.max(maxConsecutive, 2)
    }

    straightDrawPossible = maxConsecutive >= 2 && uniqueValues[uniqueValues.length - 1] - uniqueValues[0] <= 4
    connectedness = Math.min(1, maxConsecutive / Math.max(uniqueValues.length, 1))

    // 调高：如果牌都在一个很小的范围内
    const spread = uniqueValues[uniqueValues.length - 1] - uniqueValues[0]
    if (spread <= 4 && uniqueValues.length >= 3) {
      straightDrawPossible = true
      connectedness = Math.min(1, connectedness + 0.3)
    }
  }

  // 判断板面类型
  let type = 'dry'
  if (monotone) {
    type = 'monotone'
  } else if (paired) {
    type = 'paired'
  } else if (straightDrawPossible && flushDrawPossible && !rainbow) {
    type = 'wet'
  } else if (connectedness >= 0.6 || (straightDrawPossible && twoTone)) {
    type = 'dynamic'
  }

  return {
    type,
    flushDrawPossible,
    straightDrawPossible,
    highCard,
    connectedness,
    paired,
    monotone,
    twoTone,
    rainbow,
  }
}
