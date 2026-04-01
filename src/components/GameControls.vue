<template>
  <div class="game-controls">
    <button @click="$emit('reset-game')" class="control-button">新游戏</button>
    <button 
      @click="$emit('toggle-gto-debug')" 
      class="control-button gto-debug-toggle" 
      :class="{ active: showGTODebug }"
    >
      AI分析
    </button>
    <div class="difficulty-selector">
      <label>AI难度:</label>
      <select 
        :value="aiDifficulty" 
        @change="$emit('set-ai-difficulty', $event.target.value)" 
        class="difficulty-select"
      >
        <option v-for="level in availableDifficulties" :key="level.key" :value="level.key">
          {{ level.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showGTODebug: Boolean,
  aiDifficulty: String,
  availableDifficulties: Array
})
defineEmits(['reset-game', 'toggle-gto-debug', 'set-ai-difficulty'])
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: center;
  align-items: center;
   gap: 8px;
   padding: 6px 8px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  flex-wrap: wrap;
}

.control-button {
  padding: 6px 12px;
   border: none;
   border-radius: 6px;
   background: linear-gradient(135deg, #4a9eff, #8b5cf6);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
   font-size: 0.8rem;
}

.control-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
}

.gto-debug-toggle.active {
  background: linear-gradient(135deg, #00b894, #00a085);
}

.difficulty-selector {
  display: flex;
  align-items: center;
   gap: 6px;
  color: white;
  font-weight: 500;
   font-size: 0.8rem;
}

.difficulty-select {
  padding: 4px 8px;
   border: none;
   border-radius: 4px;
   background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
   font-size: 0.8rem;
}

.difficulty-select:hover {
  background: white;
}

.difficulty-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}
</style>