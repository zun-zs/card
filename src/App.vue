<template>
  <div class="poker-game">
    <div v-if="!gameStarted" class="start-screen">
      <h1 class="game-title">🃏 德州扑克</h1>
      <button @click="startGame" class="start-button">开始游戏</button>
    </div>

    <div v-else class="game-layout">
      <!-- 顶部控制栏 -->
      <header class="game-header">
        <h1 class="game-title-small">🃏 德州扑克</h1>
        <GameControls
          :ai-difficulty="aiDifficulty"
          :available-difficulties="availableDifficulties"
          :show-g-t-o-debug="showGTODebug"
          @reset-game="resetGame"
          @toggle-gto-debug="toggleGTODebug"
          @set-ai-difficulty="setAIDifficulty"
        />
      </header>

      <!-- 主游戏区域 -->
      <main class="game-main">
        <!-- 游戏桌面 -->
        <GameTable
          :community-cards="communityCards"
          :opponent-chips="opponentChips"
          :opponent-bet="opponentBet"
          :opponent-cards="opponentCards"
          :showdown="showdown"
          :pot="pot"
          :status-message="statusMessage"
          :player-chips="playerChips"
          :player-bet="playerBet"
          :player-cards="playerCards"
          :player-win-rate="playerWinRate"
          :hand-strength="handStrength"
          :player-turn="playerTurn"
          :game-started="gameStarted"
          :can-check="canCheck"
          :can-call="canCall"
          :call-amount="callAmount"
          :min-raise="minRaise"
          :raise-amount="raiseAmount"
          @player-action="playerAction"
          @update-raise-amount="updateRaiseAmount"
          @set-quick-raise="setQuickRaise"
        />

        <!-- AI调试面板 - 侧边显示 -->
        <aside v-if="showGTODebug" class="debug-sidebar">
          <AIDebugPanel
            :show-g-t-o-debug="showGTODebug"
            :gto-debug-info="gtoDebugInfo"
            :ai-engine-name="aiEngine?.config?.name || 'AI引擎'"
          />
        </aside>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Card from './components/Card.vue'
import GameTable from './components/GameTable.vue'
import GameControls from './components/GameControls.vue'
import AIDebugPanel from './components/AIDebugPanel.vue'
import { createGameState } from './utils/gameState.js'
import { createGameLogic } from './utils/gameLogic.js'

export default {
  name: 'PokerGame',
  components: {
    Card,
    GameTable,
    GameControls,
    AIDebugPanel
  },
  setup() {
    // 创建游戏状态和逻辑
    const gameState = createGameState()
    const gameLogic = createGameLogic(gameState)

    // 从gameState解构所有需要的状态
    const {
      gameStarted,
      playerCards,
      opponentCards,
      communityCards,
      gameStage,
      playerTurn,
      showdown,
      statusMessage,
      raiseAmount,
      showGTODebug,
      gtoDebugInfo,
      aiDifficulty,
      availableDifficulties,
      aiEngine,
      // 计算属性
      playerChips,
      opponentChips,
      playerBet,
      opponentBet,
      pot,
      minRaise,
      callAmount,
      canCheck,
      canCall,
      playerWinRate,
      handStrength
    } = gameState

    // 从gameLogic解构所有需要的方法
    const {
      startGame,
      resetGame,
      playerAction,
      setQuickRaise,
      setAIDifficulty,
      toggleGTODebug,
      opponentAction
    } = gameLogic

    // 将gameLogic暴露到window对象上，供resetGameState调用
    window.gameLogic = {
      opponentAction
    }



    return {
      gameStarted,
      showdown,
      playerTurn,
      statusMessage,
      communityCards,
      playerCards,
      opponentCards,
      gameStage,
      playerChips,
      opponentChips,
      playerBet,
      opponentBet,
      pot,
      raiseAmount,
      minRaise,
      callAmount,
      canCheck,
      canCall,
      playerWinRate,
      handStrength,
      showGTODebug,
      gtoDebugInfo,
      aiEngine,
      aiDifficulty,
      availableDifficulties,
      startGame,
      resetGame,
      playerAction,
      setQuickRaise,
      toggleGTODebug,
      setAIDifficulty,
      updateRaiseAmount: (amount) => {
        raiseAmount.value = parseInt(amount, 10)
      }
    }
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  overflow: hidden;
}

.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 100px);
}

.start-button {
  padding: 12px 30px;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}
</style>
