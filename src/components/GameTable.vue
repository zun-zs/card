<template>
  <div class="game-table">
    <!-- 对手区域 -->
    <div class="table-section opponent-section">
      <OpponentArea 
        :opponent-chips="opponentChips"
        :opponent-bet="opponentBet"
        :opponent-cards="opponentCards"
        :showdown="showdown"
      />
    </div>
    
    <!-- 公共牌区域 -->
    <div class="table-section community-section">
      <div class="community-cards">
        <h3>公共牌</h3>
        <div class="cards-container">
          <Card 
            v-for="(card, index) in communityCards" 
            :key="'community-' + index"
            :card="card"
          />
        </div>
      </div>
      
      <!-- 游戏状态 -->
      <div class="game-status">
        <div class="pot">🏆 底池: {{ pot }}</div>
        <div class="current-action">{{ statusMessage }}</div>
      </div>
    </div>
    
    <!-- 玩家区域 -->
    <div class="table-section player-section">
      <PlayerArea 
        :player-chips="playerChips"
        :player-bet="playerBet"
        :player-cards="playerCards"
        :player-win-rate="playerWinRate"
        :hand-strength="handStrength"
        :player-turn="playerTurn"
        :showdown="showdown"
        :game-started="gameStarted"
        :can-check="canCheck"
        :can-call="canCall"
        :call-amount="callAmount"
        :min-raise="minRaise"
        :raise-amount="raiseAmount"
        @player-action="$emit('player-action', $event)"
        @update-raise-amount="$emit('update-raise-amount', $event)"
        @set-quick-raise="$emit('set-quick-raise', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import Card from './Card.vue'
import PlayerArea from './PlayerArea.vue'
import OpponentArea from './OpponentArea.vue'

defineProps({
  communityCards: Array,
  opponentChips: Number,
  opponentBet: Number,
  opponentCards: Array,
  showdown: Boolean,
  pot: Number,
  statusMessage: String,
  playerChips: Number,
  playerBet: Number,
  playerCards: Array,
  playerWinRate: Object,
  handStrength: String,
  playerTurn: Boolean,
  gameStarted: Boolean,
  canCheck: Boolean,
  canCall: Boolean,
  callAmount: Number,
  minRaise: Number,
  raiseAmount: Number
})

defineEmits(['player-action', 'update-raise-amount', 'set-quick-raise'])
</script>

<style scoped>
.game-table {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 10px;
  flex: 1;
  min-height: 0;
  background: radial-gradient(ellipse at center, #1b4a2c 0%, #0d3d20 100%);
  border-radius: 18px;
  padding: 12px;
  position: relative;
  overflow: hidden;
}

.game-table::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92%;
  height: 86%;
  border: 2px solid rgba(255, 215, 0, 0.18);
  border-radius: 50%;
  pointer-events: none;
}

.table-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.opponent-section {
  flex: 0 0 auto;
  padding-bottom: 4px;
}

.community-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.player-section {
  flex: 0 0 auto;
  padding-top: 4px;
}

.community-cards {
  text-align: center;
}

.community-cards h3 {
  margin-bottom: 6px;
  color: #ffd700;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.game-status {
  text-align: center;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.25);
}

.pot {
  font-size: 1rem;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 4px;
}

.current-action {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}
</style>