// 轻量 composable：封装并重导出牌组与评估工具，方便将来替换实现
export { 
  createDeck, 
  shuffleDeck, 
  dealCards, 
  evaluateHand, 
  compareHands, 
  getBestHand, 
  calculateWinRate, 
  getHandName, 
  getHandStrength
} from '../utils/cardUtils.js'

// 仅使用命名导出；避免引入不必要的默认绑定
 
// 发公共牌的简单封装，操作普通数组（适用于传入 `deck.value` / `communityCards.value`）
export function dealFlop(deck, communityCards) {
  for (let i = 0; i < 3; i++) {
    if (deck.length > 0) communityCards.push(deck.pop())
  }
}

export function dealTurn(deck, communityCards) {
  if (deck.length > 0) communityCards.push(deck.pop())
}

export function dealRiver(deck, communityCards) {
  if (deck.length > 0) communityCards.push(deck.pop())
}

