<template>
  <div class="player">
    <h3>玩家</h3>
    <div class="player-info">
      <div class="chips">筹码: {{ playerChips }}</div>
      <div class="current-bet">本轮下注: {{ playerBet }}</div>
    </div>
    <div class="cards-container">
      <Card 
        v-for="(card, index) in playerCards" 
        :key="'player-' + index"
        :card="card"
      />
    </div>
    
    <WinRateDisplay 
      v-if="gameStarted && !showdown && playerCards.length > 0"
      :player-win-rate="playerWinRate"
      :hand-strength="handStrength"
    />
    
    <PlayerActions 
      v-if="playerTurn && !showdown"
      :can-check="canCheck"
      :can-call="canCall"
      :call-amount="callAmount"
      :player-chips="playerChips"
      :min-raise="minRaise"
      :raise-amount="raiseAmount"
      :player-turn="playerTurn"
      @player-action="$emit('player-action', $event)"
      @update-raise-amount="$emit('update-raise-amount', $event)"
      @set-quick-raise="$emit('set-quick-raise', $event)"
    />
  </div>
</template>

<script>
import Card from './Card.vue'
import WinRateDisplay from './WinRateDisplay.vue'
import PlayerActions from './PlayerActions.vue'

export default {
  name: 'PlayerArea',
  components: {
    Card,
    WinRateDisplay,
    PlayerActions
  },
  props: {
    playerChips: Number,
    playerBet: Number,
    playerCards: Array,
    playerWinRate: Object,
    handStrength: String,
    playerTurn: Boolean,
    showdown: Boolean,
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
.player {
  border-radius: 8px;
  padding: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.player h3 {
  margin: 0 0 6px 0;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  flex-shrink: 0;
}

.player-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
</style>