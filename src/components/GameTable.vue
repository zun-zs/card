<template>
  <div class="game-table">
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
    
    <div class="player-area">
      <OpponentArea 
        :opponent-chips="opponentChips"
        :opponent-bet="opponentBet"
        :opponent-cards="opponentCards"
        :showdown="showdown"
      />
      
      <div class="game-status">
        <div class="pot">底池: {{ pot }}</div>
        <div class="current-action">{{ statusMessage }}</div>
      </div>
      
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

<script>
import Card from './Card.vue'
import PlayerArea from './PlayerArea.vue'
import OpponentArea from './OpponentArea.vue'

export default {
  name: 'GameTable',
  components: {
    Card,
    PlayerArea,
    OpponentArea
  },
  props: {
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
  },
  emits: ['player-action', 'update-raise-amount', 'set-quick-raise']
}
</script>

<style scoped>
.game-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.community-cards {
  text-align: center;
  flex-shrink: 0;
}

.community-cards h3 {
  margin-bottom: 5px;
  color: #333;
  font-size: 0.9rem;
  font-weight: 600;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.player-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.game-status {
  text-align: center;
  padding: 6px;
  border-radius: 6px;
  color: white;
  flex-shrink: 0;
}

.pot {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.current-action {
  font-size: 0.85rem;
  opacity: 0.9;
}
</style>