<template>
  <div class="win-rate-info">
    <div class="win-rate-display">
      <span class="win-rate-label">胜率:</span>
      <span class="win-rate-value" :class="`strength-${handStrength}`">{{ playerWinRate.winRate }}%</span>
      <span class="hand-strength">({{ handStrength }})</span>
    </div>
    <div class="detailed-rates">
      <span class="win-detail">胜: {{ playerWinRate.winRate }}%</span>
      <span class="tie-detail">平: {{ playerWinRate.tieRate }}%</span>
      <span class="lose-detail">负: {{ playerWinRate.loseRate }}%</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WinRateDisplay',
  props: {
    playerWinRate: {
      type: Object,
      required: true
    },
    handStrength: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.win-rate-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  backdrop-filter: blur(10px);
}

.win-rate-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 1.1em;
  font-weight: bold;
}

.win-rate-label {
  color: rgba(255, 255, 255, 0.8);
}

.win-rate-value {
  font-size: 1.3em;
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.2);
}

.strength-very-weak {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.2) !important;
}

.strength-weak {
  color: #ffa726;
  background: rgba(255, 167, 38, 0.2) !important;
}

.strength-medium {
  color: #ffeb3b;
  background: rgba(255, 235, 59, 0.2) !important;
}

.strength-strong {
  color: #66bb6a;
  background: rgba(102, 187, 106, 0.2) !important;
}

.strength-very-strong {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2) !important;
}

.hand-strength {
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);
}

.detailed-rates {
  display: flex;
  justify-content: space-around;
  font-size: 0.9em;
}

.win-detail {
  color: #4caf50;
}

.tie-detail {
  color: #ffeb3b;
}

.lose-detail {
  color: #ff6b6b;
}
</style>