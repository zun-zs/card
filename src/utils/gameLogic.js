import { evaluateHand, getBestHand, compareHands } from './cardUtils.js'
import { gameFinance } from './gameFinance.js'

export function createGameLogic(gameState) {
  const {
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
    aiEngine,
    aiDifficulty,
    playerChips,
    opponentChips,
    playerBet,
    opponentBet,
    pot,
    callAmount,
    playerWinRate,
    gtoDebugInfo,
    toggleGTODebug,
    resetGameState
  } = gameState

  // 游戏状态标志
  let isProcessingAction = false
  let gameEnded = false

  // 推进游戏阶段
  const advanceGameStage = () => {
    const stages = ['preflop', 'flop', 'turn', 'river', 'showdown']
    const currentIndex = stages.indexOf(gameStage.value)

    if (currentIndex < stages.length - 1) {
      gameStage.value = stages[currentIndex + 1]
      console.log(`🎯 游戏阶段推进到: ${gameStage.value}`)

      // 推进金融模块的阶段（包含重置下注状态和更新currentStage）
      gameFinance.advanceStage()

      // 发公共牌
      dealCommunityCards(gameStage.value)

      // 设置行动权（通常小盲注先行动）
      playerTurn.value = true

      return gameStage.value
    }

    return 'showdown'
  }

  // 开始游戏
  const startGame = () => {
    console.log('🎮 开始新游戏')
    gameStarted.value = true
    gameEnded = false
    isProcessingAction = false
    resetGameState()
    statusMessage.value = '游戏开始！'

    // 如果AI先行动，自动触发AI行动
    setTimeout(() => {
      if (!playerTurn.value) {
        opponentAction()
      }
    }, 1000)
  }

  // 重置游戏
  const resetGame = () => {
    console.log('🔄 重置游戏')

    // 清理所有pending的timeout
    if (window.gameTimeouts) {
      window.gameTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId)
      })
      window.gameTimeouts = []
      console.log('🧹 已清理所有timeout')
    }

    gameEnded = false
    isProcessingAction = false
    // 重置游戏时不收取盲注，避免重复扣除
    resetGameState(false)
  }

  // 开始新一局
  const startNewRound = () => {
    console.log('🎯 开始新一局')

    // 清理所有pending的timeout
    if (window.gameTimeouts) {
      window.gameTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId)
      })
      window.gameTimeouts = []
    }

    gameEnded = false
    isProcessingAction = false
    // 开始新一局时收取盲注
    resetGameState(true)
    statusMessage.value = '新一局开始！'

    // 如果AI先行动，自动触发AI行动
    setTimeout(() => {
      if (!playerTurn.value && !gameEnded) {
        opponentAction()
      }
    }, 1000)
  }

  // 玩家行动
  const playerAction = (action) => {
    // 防止重复处理
    if (isProcessingAction || gameEnded || !playerTurn.value) {
      console.log('⚠️ 行动被阻止：', { isProcessingAction, gameEnded, playerTurn: playerTurn.value })
      return
    }

    // 检查AI筹码是否为0，如果为0则游戏结束
    if (opponentChips.value <= 0) {
      console.log('🏆 AI筹码为0，玩家获胜')
      statusMessage.value = '🎉 电脑筹码不足，你获胜！'
      gameFinance.distributePot('player')
      gameEnded = true

      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 3000)
      return
    }

    // 检查玩家筹码是否为0，如果为0则游戏结束
    if (playerChips.value <= 0) {
      console.log('🏆 玩家筹码为0，AI获胜')
      statusMessage.value = '😔 你的筹码不足，电脑获胜！'
      gameFinance.distributePot('opponent')
      gameEnded = true

      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 3000)
      return
    }

    isProcessingAction = true
    console.log(`👤 玩家行动: ${action}`)

    // 更新AI的对手建模
    try {
      const estimatedWinRate = playerWinRate.value?.winRate || 0.5
      const betSize = action === 'raise' ? raiseAmount.value : (action === 'call' ? callAmount.value : 0)
      aiEngine.updateOpponentModel(action, gameStage.value, estimatedWinRate, betSize, pot.value)
    } catch (error) {
      console.warn('AI建模更新失败:', error)
    }

    // 执行玩家行动
    switch (action) {
      case 'fold':
        handlePlayerFold()
        break
      case 'check':
        handlePlayerCheck()
        break
      case 'call':
        handlePlayerCall()
        break
      case 'raise':
        handlePlayerRaise()
        break
      default:
        console.error('未知行动:', action)
        isProcessingAction = false
    }
  }

  // 玩家弃牌
  const handlePlayerFold = () => {
    console.log('👤 玩家弃牌')
    statusMessage.value = '你选择弃牌，电脑获胜'
    gameFinance.distributePot('opponent')
    gameEnded = true

    setTimeout(() => {
      isProcessingAction = false
      startNewRound()
    }, 2000)
  }

  // 玩家看牌
  const handlePlayerCheck = () => {
    console.log('👤 玩家看牌')
    const result = gameFinance.playerCheck()

    if (!result.success) {
      statusMessage.value = result.message
      isProcessingAction = false
      return
    }

    statusMessage.value = result.message
    playerTurn.value = false

    // 延迟处理后续逻辑
    setTimeout(() => {
      processNextAction()
    }, 1000)
  }

  // 玩家跟注
  const handlePlayerCall = () => {
    console.log('👤 玩家跟注')
    const result = gameFinance.playerCall()

    if (!result.success) {
      statusMessage.value = result.message
      isProcessingAction = false
      return
    }

    statusMessage.value = result.message
    playerTurn.value = false

    // 延迟处理后续逻辑
    setTimeout(() => {
      processNextAction()
    }, 1000)
  }

  // 玩家加注
  const handlePlayerRaise = () => {
    console.log('👤 玩家加注:', raiseAmount.value)
    const result = gameFinance.playerRaise(raiseAmount.value)

    if (!result.success) {
      statusMessage.value = result.message
      isProcessingAction = false
      return
    }

    statusMessage.value = result.message
    playerTurn.value = false

    // 延迟处理AI行动
    setTimeout(() => {
      executeOpponentAction()
    }, 1000)
  }

  // 处理下一步行动的统一逻辑
  const processNextAction = () => {
    if (gameEnded) {
      isProcessingAction = false
      return
    }

    // 检查是否可以进入下一阶段
    if (gameFinance.canAdvanceStage()) {
      console.log('🎯 进入下一阶段')
      const nextStage = advanceGameStage()
      if (nextStage === 'showdown') {
        handleShowdown()
      } else {
        // 新阶段开始，玩家先行动（德州扑克规则：翻牌后小盲注先行动）
        setTimeout(() => {
          if (!gameEnded) {
            playerTurn.value = true
            isProcessingAction = false
            statusMessage.value = '轮到你行动'
          }
        }, 800)
      }
    } else {
      // 继续当前阶段，AI行动
      executeOpponentAction()
    }
  }

  // 设置快速加注
  const setQuickRaise = (type) => {
    let targetAmount

    if (typeof type === 'string') {
      // 使用预定义的快速加注类型
      targetAmount = gameFinance.getQuickRaiseAmount(type)
    } else {
      // 直接传入数值
      const range = gameFinance.getValidRaiseRange('player')
      targetAmount = Math.max(range.min, Math.min(range.max, type))
    }

    raiseAmount.value = targetAmount
  }

  // 设置AI难度
  const setAIDifficulty = (difficulty) => {
    aiDifficulty.value = difficulty
    aiEngine.setDifficulty(difficulty)
    statusMessage.value = `AI难度已设置为: ${aiEngine.config.name}`
  }

  // 执行AI行动
  const executeOpponentAction = () => {
    if (gameEnded || !isProcessingAction) {
      console.log('⚠️ 游戏状态不允许AI行动')
      isProcessingAction = false
      return
    }

    console.log('🤖 AI开始思考...')
    gameState.statusMessage = '电脑正在思考...'

    // 延迟AI决策，增加真实感
    const aiThinkingTimeout = setTimeout(() => {
      // 再次检查游戏状态
      if (gameEnded || !isProcessingAction) {
        console.log('⚠️ AI思考期间游戏状态已变化')
        isProcessingAction = false
        return
      }

      try {
        const aiDecision = makeAIDecision()
        executeAIAction(aiDecision)
      } catch (error) {
        console.error('❌ AI决策失败:', error)
        isProcessingAction = false
        gameState.statusMessage = 'AI决策出错，请重新开始游戏'
      }
    }, 1000) // 减少延迟时间

    // 存储timeout ID以便可能的清理
    if (!window.gameTimeouts) window.gameTimeouts = []
    window.gameTimeouts.push(aiThinkingTimeout)
  }

  // 生成AI决策
  const makeAIDecision = () => {
    try {
      const gameStateForAI = {
        playerCards: playerCards.value,
        opponentCards: opponentCards.value,
        communityCards: communityCards.value,
        gameStage: gameStage.value,
        pot: pot.value,
        playerBet: playerBet.value,
        opponentBet: opponentBet.value,
        playerChips: playerChips.value,
        opponentChips: opponentChips.value,
        callAmount: callAmount.value,
        minRaise: gameFinance.minRaise
      }

      return aiEngine.makeDecision(gameStateForAI)
    } catch (error) {
      console.error('AI决策失败:', error)
      // 返回默认的保守决策
      return {
        action: 'check',
        reasoning: '保守策略',
        confidence: 0.5,
        debugInfo: {}
      }
    }
  }

  // 执行AI行动
  const executeAIAction = (aiDecision) => {
    console.log('🤖 AI行动:', aiDecision.action)

    // 保存调试信息
    try {
      gtoDebugInfo.value = {
        ...aiDecision.debugInfo,
        timestamp: new Date().toLocaleTimeString(),
        gameStage: gameStage.value,
        action: aiDecision.action,
        reasoning: aiDecision.reasoning,
        confidence: Math.round((aiDecision.confidence || 0.5) * 100)
      }
    } catch (error) {
      console.warn('保存调试信息失败:', error)
    }

    // 根据AI决策执行行动
    switch (aiDecision.action) {
      case 'fold':
        handleAIFold(aiDecision)
        break
      case 'call':
        handleAICall(aiDecision)
        break
      case 'raise':
        handleAIRaise(aiDecision)
        break
      case 'check':
      default:
        handleAICheck(aiDecision)
        break
    }
  }

  // AI弃牌
  const handleAIFold = (aiDecision) => {
    console.log('🤖 AI弃牌')
    statusMessage.value = '电脑选择弃牌，你获胜！'
    gameFinance.distributePot('player')
    gameEnded = true

    setTimeout(() => {
      isProcessingAction = false
      startNewRound()
    }, 2000)
  }

  // AI跟注
  const handleAICall = (aiDecision) => {
    console.log('🤖 AI跟注')

    // 添加调试信息
    const callAmount = gameFinance.getCallAmount('opponent')
    const opponentChips = gameFinance.opponentChips
    const playerBet = gameFinance.playerBet
    const opponentBet = gameFinance.opponentBet

    console.log('AI跟注调试信息:', {
      callAmount,
      opponentChips,
      playerBet,
      opponentBet,
      canCall: gameFinance.canCall('opponent')
    })

    const result = gameFinance.opponentCall()

    if (result.success) {
      statusMessage.value = `${result.message} (${aiDecision.reasoning})`

      // 检查是否可以进入下一阶段
      if (gameFinance.canAdvanceStage()) {
        setTimeout(() => {
          if (!gameEnded) {
            console.log('🎯 AI跟注后进入下一阶段')
            const nextStage = advanceGameStage()
            if (nextStage === 'showdown') {
              handleShowdown()
            } else {
              // 新阶段开始，玩家先行动
              playerTurn.value = true
              isProcessingAction = false
              statusMessage.value = '轮到你行动'
            }
          }
        }, 1000)
      } else {
        // 继续当前阶段，轮到玩家行动
        setTimeout(() => {
          playerTurn.value = true
          isProcessingAction = false
          statusMessage.value = '轮到你行动'
        }, 1000)
      }
    } else {
      console.error('AI跟注失败:', result.message)
      statusMessage.value = `电脑无法跟注: ${result.message}`
      isProcessingAction = false
    }
  }

  // AI加注
  const handleAIRaise = (aiDecision) => {
    console.log('🤖 AI加注:', aiDecision.amount)
    const result = gameFinance.opponentRaise(aiDecision.amount)

    if (result.success) {
      statusMessage.value = `${result.message} (${aiDecision.reasoning})`
      playerTurn.value = true

      setTimeout(() => {
        isProcessingAction = false
        statusMessage.value = '轮到你行动'
      }, 1000)
    } else {
      console.error('AI加注失败:', result.message)
      // 加注失败，尝试跟注
      handleAICall({ ...aiDecision, reasoning: '加注失败，改为跟注' })
    }
  }

  // AI看牌
  const handleAICheck = (aiDecision) => {
    console.log('🤖 AI看牌')
    const result = gameFinance.opponentCheck()

    if (result.success) {
      statusMessage.value = `${result.message} (${aiDecision.reasoning})`

      // 检查是否可以进入下一阶段
      if (gameFinance.canAdvanceStage()) {
        setTimeout(() => {
          if (!gameEnded) {
            console.log('🎯 AI看牌后进入下一阶段')
            const nextStage = advanceGameStage()
            if (nextStage === 'showdown') {
              handleShowdown()
            } else {
              // 新阶段开始，玩家先行动
              playerTurn.value = true
              isProcessingAction = false
              statusMessage.value = '轮到你行动'
            }
          }
        }, 1000)
      } else {
        // 继续当前阶段，轮到玩家行动
        setTimeout(() => {
          playerTurn.value = true
          isProcessingAction = false
          statusMessage.value = '轮到你行动'
        }, 1000)
      }
    } else {
      console.error('AI看牌失败:', result.message)
      statusMessage.value = `电脑无法看牌: ${result.message}`
      isProcessingAction = false
    }
  }



  // 发公共牌
  const dealCommunityCards = (stage) => {
    switch (stage) {
      case 'flop':
        // 发3张公共牌
        for (let i = 0; i < 3; i++) {
          if (deck.value.length > 0) {
            communityCards.value.push(deck.value.pop())
          }
        }
        statusMessage.value = '翻牌圈开始'
        console.log('🃏 发出翻牌:', communityCards.value.slice(-3))
        break

      case 'turn':
        // 发第4张公共牌
        if (deck.value.length > 0) {
          communityCards.value.push(deck.value.pop())
        }
        statusMessage.value = '转牌圈开始'
        console.log('🃏 发出转牌:', communityCards.value.slice(-1))
        break

      case 'river':
        // 发第5张公共牌
        if (deck.value.length > 0) {
          communityCards.value.push(deck.value.pop())
        }
        statusMessage.value = '河牌圈开始'
        console.log('🃏 发出河牌:', communityCards.value.slice(-1))
        break

      case 'showdown':
        statusMessage.value = '摊牌阶段'
        console.log('🎭 进入摊牌阶段')
        break
    }
  }

  // 处理摊牌
  const handleShowdown = () => {
    console.log('🎭 开始摊牌')
    showdown.value = true
    gameEnded = true

    try {
      // 计算牌力
      const playerHand = [...playerCards.value, ...communityCards.value]
      const opponentHand = [...opponentCards.value, ...communityCards.value]

      console.log('玩家手牌:', playerCards.value)
      console.log('电脑手牌:', opponentCards.value)
      console.log('公共牌:', communityCards.value)

      const playerHandRank = evaluateHand(playerHand)
      const opponentHandRank = evaluateHand(opponentHand)

      console.log('玩家牌力:', playerHandRank)
      console.log('电脑牌力:', opponentHandRank)

      // 显示对手的牌
      showOpponentCards.value = true

      // 比较牌力并确定胜负
      const winner = determineWinner(playerHandRank, opponentHandRank)

      // 记录分配前的筹码总数用于验证
      const totalChipsBefore = gameFinance.playerChips + gameFinance.opponentChips + gameFinance.pot
      console.log('🔍 分配前筹码总数:', totalChipsBefore)

      // 分配底池
      gameFinance.distributePot(winner)

      // 验证筹码守恒
      const totalChipsAfter = gameFinance.playerChips + gameFinance.opponentChips
      console.log('🔍 分配后筹码总数:', totalChipsAfter)
      if (totalChipsBefore !== totalChipsAfter) {
        console.error('⚠️ 筹码总数不守恒！', { before: totalChipsBefore, after: totalChipsAfter })
      }

      // 3秒后开始新一局
      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 3000)

    } catch (error) {
      console.error('摊牌过程出错:', error)
      statusMessage.value = '摊牌出错，重新开始游戏'
      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 2000)
    }
  }

  // 确定胜负
  const determineWinner = (playerHandRank, opponentHandRank) => {
    let winner

    // 使用新的牌型评估系统
    const playerAllCards = [...playerCards.value, ...communityCards.value]
    const opponentAllCards = [...opponentCards.value, ...communityCards.value]

    console.log('玩家所有牌:', playerAllCards)
    console.log('对手所有牌:', opponentAllCards)

    // 获取最佳牌型
    const playerBestHand = getBestHand(playerAllCards)
    const opponentBestHand = getBestHand(opponentAllCards)

    console.log('玩家最佳牌型:', playerBestHand.evaluation)
    console.log('对手最佳牌型:', opponentBestHand.evaluation)

    // 比较牌型
    const comparison = compareHands(playerBestHand.cards, opponentBestHand.cards)

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

  // AI行动入口函数
  const opponentAction = () => {
    if (isProcessingAction || gameEnded) {
      console.log('⚠️ 正在处理行动或游戏已结束，跳过AI行动')
      return
    }

    // 检查AI筹码是否为0，如果为0则游戏结束
    if (opponentChips.value <= 0) {
      console.log('🏆 AI筹码为0，玩家获胜')
      statusMessage.value = '🎉 电脑筹码不足，你获胜！'
      gameFinance.distributePot('player')
      gameEnded = true

      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 3000)
      return
    }

    // 检查玩家筹码是否为0，如果为0则游戏结束
    if (playerChips.value <= 0) {
      console.log('🏆 玩家筹码为0，AI获胜')
      statusMessage.value = '😔 你的筹码不足，电脑获胜！'
      gameFinance.distributePot('opponent')
      gameEnded = true

      setTimeout(() => {
        isProcessingAction = false
        startNewRound()
      }, 3000)
      return
    }

    isProcessingAction = true
    executeOpponentAction()
  }

  return {
    startGame,
    resetGame,
    startNewRound,
    playerAction,
    opponentAction,
    setQuickRaise,
    setAIDifficulty,
    makeAIDecision,
    toggleGTODebug
  }
}
