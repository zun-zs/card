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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
}

.player h3 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #b8c5d6;
}

.player-info {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.chips {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 700;
  font-size: 0.75rem;
}

.current-bet {
  background: linear-gradient(135deg, rgba(74, 158, 255, 0.8), rgba(42, 49, 80, 0.8));
  padding: 4px 10px;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.75rem;
  border: 1px solid #4a9eff;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>