import { dealFlop, dealTurn, dealRiver, getBestHand, compareHands } from './useDeck.js'

export function createRoundHelpers(gameState) {
  const {
    deck,
    communityCards,
    playerCards,
    opponentCards,
    statusMessage,
    showOpponentCards
  } = gameState

  const dealCommunityCards = (stage) => {
    switch (stage) {
      case 'flop':
        dealFlop(deck.value, communityCards.value)
        statusMessage.value = '翻牌圈开始'
        console.log('🃏 发出翻牌:', communityCards.value.slice(-3))
        break
      case 'turn':
        dealTurn(deck.value, communityCards.value)
        statusMessage.value = '转牌圈开始'
        console.log('🃏 发出转牌:', communityCards.value.slice(-1))
        break
      case 'river':
        dealRiver(deck.value, communityCards.value)
        statusMessage.value = '河牌圈开始'
        console.log('🃏 发出河牌:', communityCards.value.slice(-1))
        break
      case 'showdown':
        statusMessage.value = '摊牌阶段'
        console.log('🎭 进入摊牌阶段')
        break
    }
  }

  const determineWinner = () => {
    const playerAllCards = [...playerCards.value, ...communityCards.value]
    const opponentAllCards = [...opponentCards.value, ...communityCards.value]

    console.log('玩家所有牌:', playerAllCards)
    console.log('对手所有牌:', opponentAllCards)

    const playerBestHand = getBestHand(playerAllCards)
    const opponentBestHand = getBestHand(opponentAllCards)

    console.log('玩家最佳牌型:', playerBestHand.evaluation)
    console.log('对手最佳牌型:', opponentBestHand.evaluation)

    const comparison = compareHands(playerBestHand.cards, opponentBestHand.cards)

    let winner
    if (comparison > 0) {
      winner = 'player'
      statusMessage.value = `🎉 你获胜！${playerBestHand.evaluation.name} 胜过 ${opponentBestHand.evaluation.name}`
    } else if (comparison < 0) {
      winner = 'opponent'
      statusMessage.value = `😔 电脑获胜！${opponentBestHand.evaluation.name} 胜过 ${playerBestHand.evaluation.name}`
    } else {
      winner = 'tie'
      statusMessage.value = `🤝 平局！双方都是${playerBestHand.evaluation.name}`
    }

    console.log('🏆 胜负结果:', winner)
    console.log('🏆 比较结果:', comparison)

    return winner
  }

  return {
    dealCommunityCards,
    determineWinner
  }
}

export default createRoundHelpers
