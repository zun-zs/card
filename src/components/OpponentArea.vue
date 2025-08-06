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
  /* background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); */
  border-radius: 15px;
  padding: 20px;
  color: white;
  /* box-shadow: 0 8px 25px rgba(0,0,0,0.15); */
}

.opponent h3 {
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 1.3em;
}

.player-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 500;
}

.cards-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>