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
  gap: 20px;
  padding: 20px;
}

.community-cards {
  text-align: center;
}

.community-cards h3 {
  margin-bottom: 10px;
  color: #333;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.player-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.game-status {
  text-align: center;
  padding: 15px;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  border-radius: 10px;
  color: white;
  /* box-shadow: 0 4px 15px rgba(0,0,0,0.1); */
}

.pot {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
}

.current-action {
  font-size: 1.1em;
  opacity: 0.9;
}
</style>