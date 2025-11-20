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
  border-radius: 8px;
  padding: 8px;
  color: white;
  flex-shrink: 0;
}

.opponent h3 {
  margin: 0 0 6px 0;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
}

.player-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.8rem;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
</style>