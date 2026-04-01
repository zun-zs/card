/**
 * 手牌分类器 — 将两张手牌转换为标准化 169 种组合名
 * 例如 A♠ K♠ → "AKs", Q♥ T♣ → "QTo", 7♦ 7♣ → "77"
 */

const RANK_ORDER = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_DISPLAY = { '10': 'T', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A',
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9' }

/** 把 card.rank 转成数值 (2‑14) */
export function rankToValue(rank) {
  const idx = RANK_ORDER.indexOf(String(rank))
  return idx === -1 ? 0 : idx + 2 // 2→2 … A→14
}

/** 把 card.rank 转成单字符显示 (T 代替 10) */
export function rankToChar(rank) {
  return RANK_DISPLAY[String(rank)] || String(rank)
}

/**
 * 判断两张牌是否同花
 */
export function isSuited(card1, card2) {
  return card1.suit === card2.suit
}

/**
 * 判断两张牌是否口袋对
 */
export function isPocket(card1, card2) {
  return rankToValue(card1.rank) === rankToValue(card2.rank)
}

/**
 * 判断两张牌是否连张 (gap = 0)
 */
export function isConnected(card1, card2) {
  return getGap(card1, card2) === 0
}

/**
 * 返回两张牌之间的间隔 (0 = 连张, 1 = 隔一张 …)
 */
export function getGap(card1, card2) {
  const v1 = rankToValue(card1.rank)
  const v2 = rankToValue(card2.rank)
  return Math.abs(v1 - v2) - 1
}

/**
 * 将两张手牌转换为标准化名称
 * @param {Object} card1 { suit, rank }
 * @param {Object} card2 { suit, rank }
 * @returns {string} 例如 "AKs" / "QTo" / "77"
 */
export function classifyHand(card1, card2) {
  const v1 = rankToValue(card1.rank)
  const v2 = rankToValue(card2.rank)
  const c1 = rankToChar(card1.rank)
  const c2 = rankToChar(card2.rank)

  if (v1 === v2) {
    // 口袋对
    return `${c1}${c2}`
  }

  // 高牌在前
  const high = v1 > v2 ? c1 : c2
  const low = v1 > v2 ? c2 : c1
  const suffix = isSuited(card1, card2) ? 's' : 'o'

  return `${high}${low}${suffix}`
}

/**
 * 返回标准化名称在 13×13 矩阵中的行列索引
 * 行 = 较高牌 rankIndex (0=A … 12=2)
 * 列 = 较低牌 rankIndex
 * 对角线 = 对子, 上三角 = 同花, 下三角 = 非同花
 * @returns {{ row: number, col: number }}
 */
export function handToMatrixIndex(card1, card2) {
  const v1 = rankToValue(card1.rank)
  const v2 = rankToValue(card2.rank)
  // 矩阵中 A=index 0 … 2=index 12
  const idx1 = 14 - v1
  const idx2 = 14 - v2

  if (v1 === v2) return { row: idx1, col: idx1 }

  const suited = isSuited(card1, card2)
  const highIdx = Math.min(idx1, idx2)
  const lowIdx = Math.max(idx1, idx2)

  // 同花 → 上三角 (row < col), 非同花 → 下三角 (row > col)
  return suited ? { row: highIdx, col: lowIdx } : { row: lowIdx, col: highIdx }
}
