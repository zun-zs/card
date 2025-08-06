<template>
  <div class="poker-game">
    <h1 class="game-title">德州扑克</h1>
    
    <div v-if="!gameStarted" class="start-screen">
      <button @click="startGame" class="start-button">开始游戏</button>
    </div>
    
    <!-- 游戏控制面板始终显示 -->
    <GameControls 
      :show-gto-debug="showGTODebug"
      :ai-difficulty="aiDifficulty"
      :available-difficulties="availableDifficulties"
      @reset-game="resetGame"
      @toggle-gto-debug="toggleGTODebug"
      @set-ai-difficulty="setAIDifficulty"
    />
    
    <!-- AI调试面板始终显示 -->
    <AIDebugPanel 
      :show-gto-debug="showGTODebug"
      :gto-debug-info="gtoDebugInfo"
      :ai-engine-name="aiEngine?.config?.name || 'AI引擎'"
    />
    
    <div v-if="gameStarted">
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

<style>
/* 基本样式将在main.css中定义 */
</style>