<template>
  <div class="opponent">
    <h3>电脑玩家</h3>
    <div class="player-info">
      <div class="chips">筹码: {{ opponentChips }}</div>
      <div class="current-bet">本轮下注: {{ opponentBet }}</div>
    </div>
    <div class="cards-container">
      <Card 
        v-for="(card, index) in opponentCards" 
        :key="'opponent-' + index"
        :card="card"
        :hidden="!showdown"
      />
    </div>
  </div>
</template>

<script>
import Card from './Card.vue'

export default {
  name: 'OpponentArea',
  components: {
    Card
  },
  props: {
    opponentChips: Number,
    opponentBet: Number,
    opponentCards: Array,
    showdown: Boolean
  }
}
</script>

<style scoped>
.opponent {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  width: 100%;
  max-width: 350px;
}

.opponent h3 {
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
}
</style>