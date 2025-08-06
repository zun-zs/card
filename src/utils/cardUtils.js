/**
 * 扑克牌工具函数
 */

// 创建一副新牌
export function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
  const deck = []
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
    }
  }
  
  return deck
}

// 洗牌算法 (Fisher-Yates)
export function shuffleDeck(deck) {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

// 发牌
export function dealCards(deck, count) {
  return deck.splice(0, count)
}

// 获取牌的数值
function getCardValue(card) {
  const rank = card.rank
  if (rank === '1') return 14 // A牌统一处理为14
  const numRank = parseInt(rank)
  if (!isNaN(numRank)) {
    return numRank === 1 ? 14 : numRank // 确保A牌为14
  }
  // 处理字符牌面
  const faceCards = { 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
  return faceCards[rank] || 10
}

// 德州扑克牌型评估函数
export function evaluateHand(cards) {
  if (!cards || cards.length < 5) {
    return { rank: 0, name: '无效牌型', values: [] }
  }
  
  // 将牌按点数排序（从大到小）
  const sortedCards = [...cards].sort((a, b) => {
    return getCardValue(b) - getCardValue(a)
  })
  
  // 计算每个点数的出现次数
  const rankCounts = {}
  const values = []
  
  for (const card of sortedCards) {
    const value = getCardValue(card)
    values.push(value)
    rankCounts[value] = (rankCounts[value] || 0) + 1
  }
  
  // 计算每个花色的出现次数
  const suitCounts = {}
  for (const card of sortedCards) {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1
  }
  
  // 检查是否有同花（5张或以上同花色）
  const flushSuit = Object.keys(suitCounts).find(suit => suitCounts[suit] >= 5)
  const isFlush = !!flushSuit
  
  // 获取同花牌的点数（如果有同花）
  let flushValues = []
  if (isFlush) {
    flushValues = sortedCards
      .filter(card => card.suit === flushSuit)
      .map(card => getCardValue(card))
      .sort((a, b) => b - a)
      .slice(0, 5)
  }
  
  // 检查是否有顺子
  const uniqueValues = [...new Set(values)].sort((a, b) => b - a)
  let straightValues = []
  let isStraight = false
  
  // 检查普通顺子
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      straightValues = uniqueValues.slice(i, i + 5)
      isStraight = true
      break
    }
  }
  
  // 检查A-5-4-3-2顺子（轮子）
  if (!isStraight && uniqueValues.includes(14) && uniqueValues.includes(5) && 
      uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
    straightValues = [5, 4, 3, 2, 1] // A在轮子中当作1
    isStraight = true
  }
  
  // 检查同花顺
  let straightFlushValues = []
  if (isFlush && isStraight) {
    // 检查同花牌中是否有顺子
    for (let i = 0; i <= flushValues.length - 5; i++) {
      if (flushValues[i] - flushValues[i + 4] === 4) {
        straightFlushValues = flushValues.slice(i, i + 5)
        break
      }
    }
    // 检查同花轮子
    if (straightFlushValues.length === 0 && flushValues.includes(14) && 
        flushValues.includes(5) && flushValues.includes(4) && 
        flushValues.includes(3) && flushValues.includes(2)) {
      straightFlushValues = [5, 4, 3, 2, 1]
    }
  }
  
  // 分析牌型
  const counts = Object.values(rankCounts).sort((a, b) => b - a)
  const countKeys = Object.keys(rankCounts).map(k => parseInt(k)).sort((a, b) => {
    if (rankCounts[b] !== rankCounts[a]) {
      return rankCounts[b] - rankCounts[a]
    }
    return b - a
  })
  
  // 皇家同花顺
  if (straightFlushValues.length > 0 && straightFlushValues[0] === 14) {
    return { rank: 9, name: '皇家同花顺', values: straightFlushValues }
  }
  
  // 同花顺
  if (straightFlushValues.length > 0) {
    return { rank: 8, name: '同花顺', values: straightFlushValues }
  }
  
  // 四条
  if (counts[0] === 4) {
    return { 
      rank: 7, 
      name: '四条', 
      values: [countKeys[0], countKeys[1]] // 四条牌值，踢脚牌
    }
  }
  
  // 葫芦（三条+一对）
  if (counts[0] === 3 && counts[1] === 2) {
    return { 
      rank: 6, 
      name: '葫芦', 
      values: [countKeys[0], countKeys[1]] // 三条牌值，对子牌值
    }
  }
  
  // 同花
  if (isFlush) {
    return { 
      rank: 5, 
      name: '同花', 
      values: flushValues // 同花的5张牌值
    }
  }
  
  // 顺子
  if (isStraight) {
    return { 
      rank: 4, 
      name: '顺子', 
      values: straightValues // 顺子的5张牌值
    }
  }
  
  // 三条
  if (counts[0] === 3) {
    const kickers = countKeys.slice(1, 3) // 取两张踢脚牌
    return { 
      rank: 3, 
      name: '三条', 
      values: [countKeys[0], ...kickers]
    }
  }
  
  // 两对
  if (counts[0] === 2 && counts[1] === 2) {
    const kicker = countKeys[2] // 踢脚牌
    return { 
      rank: 2, 
      name: '两对', 
      values: [countKeys[0], countKeys[1], kicker]
    }
  }
  
  // 一对
  if (counts[0] === 2) {
    const kickers = countKeys.slice(1, 4) // 取三张踢脚牌
    return { 
      rank: 1, 
      name: '一对', 
      values: [countKeys[0], ...kickers]
    }
  }
  
  // 高牌
  const highCards = countKeys.slice(0, 5) // 取最大的5张牌
  return { 
    rank: 0, 
    name: '高牌', 
    values: highCards
  }
}

// 比较两手牌的大小
export function compareHands(hand1, hand2) {
  const eval1 = evaluateHand(hand1)
  const eval2 = evaluateHand(hand2)
  
  // 先比较牌型等级
  if (eval1.rank !== eval2.rank) {
    return eval1.rank - eval2.rank // 正数表示hand1更大
  }
  
  // 牌型相同，比较具体数值
  for (let i = 0; i < Math.max(eval1.values.length, eval2.values.length); i++) {
    const val1 = eval1.values[i] || 0
    const val2 = eval2.values[i] || 0
    if (val1 !== val2) {
      return val1 - val2
    }
  }
  
  return 0 // 完全相同
}

// 从7张牌中找出最佳的5张牌组合
export function getBestHand(cards) {
  if (!cards || cards.length < 5) {
    return { cards: [], evaluation: { rank: 0, name: '无效牌型', values: [] } }
  }
  
  if (cards.length === 5) {
    return { cards, evaluation: evaluateHand(cards) }
  }
  
  // 生成所有5张牌的组合
  const combinations = []
  
  function generateCombinations(start, current) {
    if (current.length === 5) {
      combinations.push([...current])
      return
    }
    
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i])
      generateCombinations(i + 1, current)
      current.pop()
    }
  }
  
  generateCombinations(0, [])
  
  // 找出最佳组合
  let bestHand = null
  let bestEvaluation = null
  
  for (const combination of combinations) {
    const evaluation = evaluateHand(combination)
    if (!bestEvaluation || compareHands(combination, bestHand) > 0) {
      bestHand = combination
      bestEvaluation = evaluation
    }
  }
  
  return { cards: bestHand, evaluation: bestEvaluation }
}

// 获取牌型名称
export function getHandName(value) {
  switch (value) {
    case 8: return '同花顺'
    case 7: return '四条'
    case 6: return '葫芦'
    case 5: return '同花'
    case 4: return '顺子'
    case 3: return '三条'
    case 2: return '两对'
    case 1: return '一对'
    case 0: return '高牌'
    default: return '未知'
  }
}

// 计算玩家胜率 (蒙特卡洛模拟)
export function calculateWinRate(playerCards, communityCards, gameStage, simulations = 1000) {
  if (!playerCards || playerCards.length !== 2) {
    return { winRate: 0, tieRate: 0, loseRate: 0 }
  }

  let wins = 0
  let ties = 0
  let losses = 0

  // 创建已知牌的集合
  const knownCards = new Set()
  playerCards.forEach(card => knownCards.add(`${card.suit}-${card.rank}`))
  communityCards.forEach(card => knownCards.add(`${card.suit}-${card.rank}`))

  // 创建剩余牌组
  const remainingDeck = createDeck().filter(card => 
    !knownCards.has(`${card.suit}-${card.rank}`)
  )

  for (let i = 0; i < simulations; i++) {
    // 洗牌
    const shuffledDeck = shuffleDeck([...remainingDeck])
    
    // 为对手发两张牌
    const opponentCards = shuffledDeck.splice(0, 2)
    
    // 补全公共牌到5张
    const simulatedCommunityCards = [...communityCards]
    const cardsNeeded = 5 - communityCards.length
    if (cardsNeeded > 0) {
      simulatedCommunityCards.push(...shuffledDeck.splice(0, cardsNeeded))
    }
    
    // 评估双方手牌
    const playerHandValue = evaluateHand([...playerCards, ...simulatedCommunityCards])
    const opponentHandValue = evaluateHand([...opponentCards, ...simulatedCommunityCards])
    
    // 比较牌型大小
    const comparison = compareHands([...playerCards, ...simulatedCommunityCards], [...opponentCards, ...simulatedCommunityCards])
    
    // 统计结果
    if (comparison > 0) {
      wins++
    } else if (comparison === 0) {
      ties++
    } else {
      losses++
    }
  }

  return {
    winRate: Math.round((wins / simulations) * 100),
    tieRate: Math.round((ties / simulations) * 100),
    loseRate: Math.round((losses / simulations) * 100)
  }
}

// 获取手牌强度描述
export function getHandStrength(winRate) {
  if (winRate >= 80) return '极强'
  if (winRate >= 65) return '强'
  if (winRate >= 50) return '中等'
  if (winRate >= 35) return '弱'
  return '极弱'
}