import { describe, it, expect, beforeEach } from 'vitest'
import { gameFinance } from '../../src/utils/gameFinance.js'

describe('GameFinance', () => {
  beforeEach(() => {
    gameFinance.reset()
  })

  it('初始化', () => {
    const state = gameFinance.getState()
    expect(state.playerChips).toBe(1000)
    expect(state.opponentChips).toBe(1000)
    expect(state.pot).toBe(0)
    expect(state.playerBet).toBe(0)
    expect(state.opponentBet).toBe(0)
  })

  it('盲注收取 - 玩家大盲注', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    const state = gameFinance.getState()

    expect(state.playerChips).toBe(980)
    expect(state.opponentChips).toBe(990)
    expect(state.playerBet).toBe(20)
    expect(state.opponentBet).toBe(10)
    expect(state.pot).toBe(30)
  })

  it('盲注收取 - 玩家小盲注', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('small')
    const state = gameFinance.getState()

    expect(state.playerChips).toBe(990)
    expect(state.opponentChips).toBe(980)
    expect(state.playerBet).toBe(10)
    expect(state.opponentBet).toBe(20)
    expect(state.pot).toBe(30)
  })

  it('翻牌前/翻牌后看牌逻辑', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    gameFinance.currentStage = 'preflop'
    expect(gameFinance.canCheck('player')).toBe(false)

    gameFinance.opponentCall()
    expect(gameFinance.canCheck('player')).toBe(true)

    // advance to flop
    gameFinance.advanceStage()
    const s2 = gameFinance.getState()
    expect(s2.currentStage).toBe('flop')
    expect(s2.canCheck).toBe(true)
  })

  it('跟注逻辑', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('small')

    expect(gameFinance.getCallAmount('player')).toBe(10)
    expect(gameFinance.canCall('player')).toBe(true)

    const result = gameFinance.playerCall()
    expect(result.success).toBe(true)

    const state = gameFinance.getState()
    expect(state.playerBet).toBe(20)
    expect(state.playerChips).toBe(980)
    expect(state.pot).toBe(40)
  })

  it('加注逻辑', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')

    const result = gameFinance.playerRaise(40)
    expect(result.success).toBe(true)

    const state = gameFinance.getState()
    expect(state.playerBet).toBe(40)
    expect(state.playerChips).toBe(960)
    expect(state.pot).toBe(50)
  })

  it('阶段推进与重置下注', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    gameFinance.opponentCall()
    expect(gameFinance.canAdvanceStage()).toBe(true)

    gameFinance.advanceStage()
    const state = gameFinance.getState()
    expect(state.playerBet).toBe(0)
    expect(state.opponentBet).toBe(0)
    expect(state.pot).toBeGreaterThan(0)
  })

  it('底池分配', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    const initialPlayerChips = gameFinance.playerChips
    const initialPot = gameFinance.pot

    gameFinance.distributePot('player')
    const state = gameFinance.getState()
    expect(state.playerChips).toBe(initialPlayerChips + initialPot)
    expect(state.pot).toBe(0)
    expect(state.playerBet).toBe(0)
    expect(state.opponentBet).toBe(0)
  })

  it('筹码不足与全下', () => {
    gameFinance.reset()
    gameFinance.setChips(15, 1000)
    gameFinance.initializeNewHand('big')
    const state = gameFinance.getState()
    expect(state.playerChips).toBeGreaterThanOrEqual(0)

    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    const allInAmount = gameFinance.playerChips + gameFinance.playerBet
    const res = gameFinance.playerRaise(allInAmount)
    expect(res.success).toBe(true)
    expect(gameFinance.playerChips).toBe(0)
  })

  it('行动权与验证', () => {
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    expect(gameFinance.whoActsFirst('preflop')).toBe('opponent')

    gameFinance.initializeNewHand('small')
    expect(gameFinance.whoActsFirst('preflop')).toBe('player')
    expect(gameFinance.whoActsFirst('flop')).toBe('player')

    // 验证状态一致性
    gameFinance.reset()
    gameFinance.initializeNewHand('big')
    gameFinance.playerRaise(40)
    gameFinance.opponentCall()
    gameFinance.advanceStage()
    const validation = gameFinance.validateState()
    expect(validation.isValid).toBe(true)
  })
})
