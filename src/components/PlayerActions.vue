<template>
  <div class="player-actions">
    <button @click="$emit('player-action', 'fold')" class="action-button fold" :disabled="!playerTurn">弃牌</button>
    <button @click="$emit('player-action', 'check')" class="action-button check" :disabled="!canCheck || !playerTurn">看牌</button>
    <button @click="$emit('player-action', 'call')" class="action-button call" :disabled="!canCall || !playerTurn">跟注 ({{ callAmount }})</button>
    
    <div class="raise-container">
      <button @click="$emit('player-action', 'raise')" class="action-button raise" :disabled="playerChips <= callAmount || !playerTurn">加注</button>
      <div class="raise-controls">
        <input 
          type="range" 
          :value="raiseAmount" 
          @input="$emit('update-raise-amount', $event.target.value)"
          :min="minRaise" 
          :max="playerChips" 
          :disabled="playerChips <= callAmount || !playerTurn" 
        />
        <span>{{ raiseAmount }}</span>
        <div class="quick-raise-buttons">
          <button @click="$emit('set-quick-raise', 'min')" class="quick-raise-button" :disabled="playerChips <= callAmount || !playerTurn">最小</button>
          <button @click="$emit('set-quick-raise', 'quarter')" class="quick-raise-button" :disabled="playerChips <= callAmount || !playerTurn">1/4</button>
          <button @click="$emit('set-quick-raise', 'half')" class="quick-raise-button" :disabled="playerChips <= callAmount || !playerTurn">1/2</button>
          <button @click="$emit('set-quick-raise', 'pot')" class="quick-raise-button" :disabled="playerChips <= callAmount || !playerTurn">底池</button>
          <button @click="$emit('set-quick-raise', 'allin')" class="quick-raise-button" :disabled="playerChips <= callAmount || !playerTurn">全下</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlayerActions',
  props: {
    canCheck: Boolean,
    canCall: Boolean,
    callAmount: Number,
    playerChips: Number,
    minRaise: Number,
    raiseAmount: Number,
    playerTurn: Boolean
  },
  emits: ['player-action', 'update-raise-amount', 'set-quick-raise']
}
</script>

<style scoped>
.player-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  flex-shrink: 0;
  margin-top: auto;
}

.action-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  min-width: 55px;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.fold {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.check {
  background: linear-gradient(135deg, #74b9ff, #0984e3);
  color: white;
}

.call {
  background: linear-gradient(135deg, #00b894, #00a085);
  color: white;
}

.raise {
  background: linear-gradient(135deg, #fdcb6e, #e17055);
  color: white;
}

.raise-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.raise-controls {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.raise-controls input[type="range"] {
  width: 100%;
  max-width: 200px;
  height: 3px;
}

.raise-controls span {
  font-size: 0.8rem;
  font-weight: bold;
}

.quick-raise-buttons {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-raise-button {
  padding: 3px 6px;
  border: none;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.7rem;
}

.quick-raise-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.quick-raise-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>