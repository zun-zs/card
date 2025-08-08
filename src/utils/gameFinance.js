/**
 * 游戏金融模块 - 处理德州扑克中的所有金额计算
 * 包括筹码管理、下注逻辑、底池计算等
 */

export class GameFinance {
  constructor() {
    this.reset()
  }

  /**
   * 重置游戏财务状态
   */
  reset() {
    this.playerChips = 1000
    this.opponentChips = 1000
    this.playerBet = 0
    this.opponentBet = 0
    this.pot = 0
    this.smallBlind = 10
    this.bigBlind = 20
    this.minRaise = 20
    this.playerPosition = 'big' // 'small' 或 'big'
    this.currentStage = 'preflop'
    this.actionCount = 0 // 当前阶段的行动次数
    this.lastAction = null // 最后一次行动
  }

  /**
   * 初始化新一局游戏
   * @param {string} playerPosition 玩家的盲注位置 'small' 或 'big'
   * @param {boolean} shouldCollectBlinds 是否收取盲注，默认为true
   */
  initializeNewHand(playerPosition = 'big', shouldCollectBlinds = true) {
    // 重置当前轮下注
    this.playerBet = 0
    this.opponentBet = 0
    
    // 只有在需要收取盲注时才重置底池
    if (shouldCollectBlinds) {
      this.pot = 0
    }
    
    // 重置行动状态
    this.currentStage = 'preflop'
    this.actionCount = 0
    this.lastAction = null
    
    // 收取盲注（如果需要）
    if (shouldCollectBlinds) {
      this.collectBlinds(playerPosition)
    } else {
      // 不收取盲注时，只设置位置和最小加注
      this.playerPosition = playerPosition
      this.minRaise = this.bigBlind
      
      // 触发UI更新
      if (this.updateUI) this.updateUI()
    }
  }

  /**
   * 收取盲注
   * @param {string} playerPosition 'small' 或 'big' - 玩家的盲注位置
   */
  collectBlinds(playerPosition = 'big') {
    if (playerPosition === 'small') {
      // 玩家支付小盲注，对手支付大盲注
      this.playerChips -= this.smallBlind
      this.playerBet = this.smallBlind
      this.pot += this.smallBlind
      
      this.opponentChips -= this.bigBlind
      this.opponentBet = this.bigBlind
      this.pot += this.bigBlind
    } else {
      // 玩家支付大盲注，对手支付小盲注
      this.playerChips -= this.bigBlind
      this.playerBet = this.bigBlind
      this.pot += this.bigBlind
      
      this.opponentChips -= this.smallBlind
      this.opponentBet = this.smallBlind
      this.pot += this.smallBlind
    }

    // 设置最小加注金额
    this.minRaise = this.bigBlind
    
    // 记录玩家位置
    this.playerPosition = playerPosition
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()
  }

  /**
   * 玩家跟注
   * @returns {Object} 操作结果
   */
  playerCall() {
    const callAmount = this.getCallAmount('player')
    
    if (callAmount <= 0) {
      return { success: false, message: '无需跟注' }
    }
    
    // 检查玩家是否有筹码
    if (this.playerChips <= 0) {
      return { success: false, message: '筹码不足' }
    }
    
    // 处理全下情况
    const actualCallAmount = Math.min(callAmount, this.playerChips)

    this.playerChips -= actualCallAmount
    this.playerBet += actualCallAmount
    this.pot += actualCallAmount
    
    // 确保筹码不为负数
    this.playerChips = Math.max(0, this.playerChips)
    
    // 记录行动
    this.recordAction('player', actualCallAmount < callAmount ? 'all-in' : 'call')
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()

    return {
      success: true,
      amount: actualCallAmount,
      message: actualCallAmount < callAmount ? `全下 ${actualCallAmount} 筹码` : `跟注 ${actualCallAmount} 筹码`,
      playerChips: this.playerChips,
      playerBet: this.playerBet,
      pot: this.pot
    }
  }

  /**
   * 玩家加注
   * @param {number} totalBetAmount 总下注金额
   * @returns {Object} 操作结果
   */
  playerRaise(totalBetAmount) {
    const currentBet = this.playerBet
    const raiseAmount = totalBetAmount - currentBet
    
    if (raiseAmount < this.minRaise) {
      return { success: false, message: `最小加注金额为 ${this.minRaise}` }
    }
    
    if (this.playerChips < raiseAmount) {
      return { success: false, message: '筹码不足' }
    }

    this.playerChips -= raiseAmount
    this.playerBet = totalBetAmount
    this.pot += raiseAmount
    
    // 更新最小加注金额
    this.minRaise = Math.max(this.minRaise, raiseAmount)
    
    // 记录行动
    this.recordAction('player', 'raise')
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()

    return {
      success: true,
      amount: raiseAmount,
      totalBet: totalBetAmount,
      message: `加注 ${raiseAmount} 筹码`,
      playerChips: this.playerChips,
      playerBet: this.playerBet,
      pot: this.pot
    }
  }

  /**
   * 对手跟注
   * @returns {Object} 操作结果
   */
  opponentCall() {
    const callAmount = this.getCallAmount('opponent')
    
    if (callAmount <= 0) {
      return { success: false, message: '无需跟注' }
    }
    
    // 检查对手是否有筹码
    if (this.opponentChips <= 0) {
      return { success: false, message: '对手筹码不足' }
    }
    
    // 处理全下情况
    const actualCallAmount = Math.min(callAmount, this.opponentChips)

    this.opponentChips -= actualCallAmount
    this.opponentBet += actualCallAmount
    this.pot += actualCallAmount
    
    // 确保筹码不为负数
    this.opponentChips = Math.max(0, this.opponentChips)
    
    // 记录行动
    this.recordAction('opponent', actualCallAmount < callAmount ? 'all-in' : 'call')
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()

    return {
      success: true,
      amount: actualCallAmount,
      message: actualCallAmount < callAmount ? `电脑全下 ${actualCallAmount} 筹码` : `电脑跟注 ${actualCallAmount} 筹码`,
      opponentChips: this.opponentChips,
      opponentBet: this.opponentBet,
      pot: this.pot
    }
  }

  /**
   * 对手加注
   * @param {number} totalBetAmount 总下注金额
   * @returns {Object} 操作结果
   */
  opponentRaise(totalBetAmount) {
    const currentBet = this.opponentBet
    const raiseAmount = totalBetAmount - currentBet
    
    if (raiseAmount < this.minRaise) {
      return { success: false, message: `最小加注金额为 ${this.minRaise}` }
    }
    
    if (this.opponentChips < raiseAmount) {
      return { success: false, message: '筹码不足' }
    }

    this.opponentChips -= raiseAmount
    this.opponentBet = totalBetAmount
    this.pot += raiseAmount
    
    // 更新最小加注金额
    this.minRaise = Math.max(this.minRaise, raiseAmount)
    
    // 记录行动
    this.recordAction('opponent', 'raise')
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()

    return {
      success: true,
      amount: raiseAmount,
      totalBet: totalBetAmount,
      message: `电脑加注 ${raiseAmount} 筹码`,
      opponentChips: this.opponentChips,
      opponentBet: this.opponentBet,
      pot: this.pot
    }
  }

  /**
   * 玩家看牌
   * @returns {Object} 操作结果
   */
  playerCheck() {
    if (!this.canCheck('player')) {
      return { success: false, message: '当前无法看牌' }
    }
    
    // 记录行动
    this.recordAction('player', 'check')
    
    return {
      success: true,
      message: '你选择看牌',
      playerChips: this.playerChips,
      playerBet: this.playerBet,
      pot: this.pot
    }
  }

  /**
   * 对手看牌
   * @returns {Object} 操作结果
   */
  opponentCheck() {
    if (!this.canCheck('opponent')) {
      return { success: false, message: '对手无法看牌' }
    }
    
    // 记录行动
    this.recordAction('opponent', 'check')
    
    return {
      success: true,
      message: '电脑选择看牌',
      opponentChips: this.opponentChips,
      opponentBet: this.opponentBet,
      pot: this.pot
    }
  }

  /**
   * 获取跟注金额
   * @param {string} player 'player' 或 'opponent'
   * @returns {number} 跟注金额
   */
  getCallAmount(player) {
    if (player === 'player') {
      return Math.max(0, this.opponentBet - this.playerBet)
    } else {
      return Math.max(0, this.playerBet - this.opponentBet)
    }
  }

  /**
   * 检查是否可以跟注
   * @param {string} player 'player' 或 'opponent'
   * @returns {boolean}
   */
  canCall(player) {
    const callAmount = this.getCallAmount(player)
    const chips = player === 'player' ? this.playerChips : this.opponentChips
    return callAmount > 0 && chips > 0
  }

  /**
   * 检查是否可以看牌
   * @param {string} player 'player' 或 'opponent'
   * @returns {boolean}
   */
  canCheck(player) {
    const callAmount = this.getCallAmount(player)
    
    // 基本条件：无需跟注
    if (callAmount > 0) {
      return false
    }
    
    // 翻牌前特殊逻辑：大盲注不能直接看牌，除非小盲注已经跟注
    if (this.currentStage === 'preflop') {
      // 如果是大盲注位置且对手还没有跟注到相同金额，不能看牌
      if ((player === 'player' && this.playerPosition === 'big' && this.opponentBet < this.playerBet) ||
          (player === 'opponent' && this.playerPosition === 'small' && this.playerBet < this.opponentBet)) {
        return false
      }
    }
    
    return true
  }

  /**
   * 获取有效的加注范围
   * @param {string} player 'player' 或 'opponent'
   * @returns {Object} {min, max}
   */
  getValidRaiseRange(player) {
    const chips = player === 'player' ? this.playerChips : this.opponentChips
    const currentBet = player === 'player' ? this.playerBet : this.opponentBet
    const opponentBet = player === 'player' ? this.opponentBet : this.playerBet
    
    // 最小加注：当前下注 + 最小加注金额，或者对手下注 + 最小加注金额
    const minTotalBet = Math.max(currentBet + this.minRaise, opponentBet + this.minRaise)
    // 最大加注：当前筹码 + 当前下注（全下）
    const maxTotalBet = chips + currentBet
    
    return {
      min: minTotalBet,
      max: maxTotalBet,
      canRaise: chips >= (minTotalBet - currentBet)
    }
  }

  /**
   * 计算快速加注金额
   * @param {string} type 'min', 'quarter', 'half', 'pot', 'allin'
   * @returns {number} 建议的总下注金额
   */
  getQuickRaiseAmount(type) {
    const range = this.getValidRaiseRange('player')
    
    switch (type) {
      case 'min':
        return range.min
      case 'quarter':
        return Math.min(range.max, this.playerBet + Math.floor(this.playerChips * 0.25))
      case 'half':
        return Math.min(range.max, this.playerBet + Math.floor(this.playerChips * 0.5))
      case 'pot':
        return Math.min(range.max, this.playerBet + this.pot)
      case 'allin':
        return range.max
      default:
        return range.min
    }
  }

  /**
   * 判断谁应该先行动
   * @param {string} stage 游戏阶段
   * @returns {string} 'player' 或 'opponent'
   */
  whoActsFirst(stage = 'preflop') {
    if (stage === 'preflop') {
      // 翻牌前：小盲注先行动
      return this.playerPosition === 'small' ? 'player' : 'opponent'
    } else {
      // 翻牌后：小盲注先行动
      return this.playerPosition === 'small' ? 'player' : 'opponent'
    }
  }

  /**
   * 检查是否可以进入下一阶段
   * @returns {boolean}
   */
  canAdvanceStage() {
    // 双方下注相等且都有过行动机会
    return this.playerBet === this.opponentBet && this.actionCount >= 2
  }

  /**
   * 记录行动
   * @param {string} player 'player' 或 'opponent'
   * @param {string} action 行动类型
   */
  recordAction(player, action) {
    this.actionCount++
    this.lastAction = { player, action, timestamp: Date.now() }
  }

  /**
   * 进入下一阶段，重置当前轮下注
   */
  advanceStage() {
    this.playerBet = 0
    this.opponentBet = 0
    this.minRaise = this.bigBlind
    this.actionCount = 0
    this.lastAction = null
    
    // 更新阶段
    const stages = ['preflop', 'flop', 'turn', 'river', 'showdown']
    const currentIndex = stages.indexOf(this.currentStage)
    if (currentIndex < stages.length - 1) {
      this.currentStage = stages[currentIndex + 1]
    }
    // 保持底池不变
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()
  }

  /**
   * 分配底池给获胜者
   * @param {string} winner 'player', 'opponent', 'tie'
   */
  distributePot(winner) {
    const potAmount = this.pot
    
    if (potAmount <= 0) {
      console.warn('底池为空，无法分配')
      return 0
    }
    
    switch (winner) {
      case 'player':
        this.playerChips += potAmount
        console.log(`玩家获得底池: ${potAmount}`)
        break
      case 'opponent':
        this.opponentChips += potAmount
        console.log(`对手获得底池: ${potAmount}`)
        break
      case 'tie':
        // 平局时，奇数筹码给位置较好的玩家（通常是按钮位）
        const halfPot = Math.floor(potAmount / 2)
        const remainder = potAmount % 2
        
        // 如果有余数，给玩家（假设玩家位置较好）
        this.playerChips += halfPot + remainder
        this.opponentChips += halfPot
        
        console.log(`平局分池: 玩家获得${halfPot + remainder}, 对手获得${halfPot}`)
        break
      default:
        console.error('无效的获胜者:', winner)
        return 0
    }
    
    // 确保筹码不为负数
    this.playerChips = Math.max(0, this.playerChips)
    this.opponentChips = Math.max(0, this.opponentChips)
    
    // 清空底池和当前下注
    this.pot = 0
    this.playerBet = 0
    this.opponentBet = 0
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()
    
    return potAmount
  }

  /**
   * 获取当前游戏状态
   * @returns {Object} 游戏财务状态
   */
  getState() {
    return {
      playerChips: this.playerChips,
      opponentChips: this.opponentChips,
      playerBet: this.playerBet,
      opponentBet: this.opponentBet,
      pot: this.pot,
      minRaise: this.minRaise,
      callAmount: this.getCallAmount('player'),
      canCall: this.canCall('player'),
      canCheck: this.canCheck('player'),
      raiseRange: this.getValidRaiseRange('player'),
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      playerPosition: this.playerPosition,
      currentStage: this.currentStage,
      actionCount: this.actionCount,
      lastAction: this.lastAction,
      canAdvanceStage: this.canAdvanceStage(),
      whoActsFirst: this.whoActsFirst(this.currentStage)
    }
  }

  /**
   * 设置筹码数量（用于测试或重置）
   * @param {number} playerChips 玩家筹码
   * @param {number} opponentChips 对手筹码
   */
  setChips(playerChips, opponentChips) {
    this.playerChips = Math.max(0, playerChips)
    this.opponentChips = Math.max(0, opponentChips)
  }

  /**
   * 重置当前轮的下注状态
   * 用于新阶段开始时清空当前下注
   */
  resetBets() {
    console.log('💰 重置当前轮下注状态')
    this.playerBet = 0
    this.opponentBet = 0
    this.minRaise = this.bigBlind  // 重置最小加注为大盲注
    this.actionCount = 0
    this.lastAction = null
    
    // 触发UI更新
    if (this.updateUI) this.updateUI()
  }

  /**
   * 验证游戏状态的一致性
   * @returns {Object} 验证结果
   */
  validateState() {
    const errors = []
    
    if (this.playerChips < 0) errors.push('玩家筹码不能为负数')
    if (this.opponentChips < 0) errors.push('对手筹码不能为负数')
    if (this.playerBet < 0) errors.push('玩家下注不能为负数')
    if (this.opponentBet < 0) errors.push('对手下注不能为负数')
    if (this.pot < 0) errors.push('底池不能为负数')
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// 创建单例实例
export const gameFinance = new GameFinance()

// 导出常量
export const BETTING_CONSTANTS = {
  SMALL_BLIND: 10,
  BIG_BLIND: 20,
  DEFAULT_CHIPS: 1000
}