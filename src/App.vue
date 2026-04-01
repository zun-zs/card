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
      <main class="game-main" :class="{ 'with-debug': showGTODebug }">
        <!-- 游戏桌面 -->
        <section class="table-area">
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
        </section>

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

<script setup>
import GameTable from './components/GameTable.vue'
import GameControls from './components/GameControls.vue'
import AIDebugPanel from './components/AIDebugPanel.vue'
import useGame from './composables/useGame.js'

// 创建或获取单例 game
const { gameState, gameLogic, updateRaiseAmount } = useGame()

// 从 gameState 解构所需状态（template 会自动解包 ref）
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

// 从 gameLogic 解构所需方法
const {
  startGame,
  resetGame,
  playerAction,
  setQuickRaise,
  setAIDifficulty,
  toggleGTODebug
} = gameLogic
</script>
