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
  border-radius: 5px;
  padding: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.win-rate-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-bottom: 4px;
  font-size: 0.85rem;
  font-weight: bold;
}

.win-rate-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.win-rate-value {
  font-size: 0.95rem;
  padding: 2px 6px;
  border-radius: 3px;
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
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.detailed-rates {
  display: flex;
  justify-content: space-around;
  font-size: 0.7rem;
  gap: 3px;
}

.win-detail {
  color: #4caf50;
  padding: 1px 4px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 2px;
}

.tie-detail {
  color: #ffeb3b;
  padding: 1px 4px;
  background: rgba(255, 235, 59, 0.1);
  border-radius: 2px;
}

.lose-detail {
  color: #ff6b6b;
  padding: 1px 4px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 2px;
}
</style>