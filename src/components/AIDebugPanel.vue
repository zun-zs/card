<template>
  <div v-if="showGTODebug" class="gto-debug-panel">
    <h3>电脑玩家AI决策分析 ({{ aiEngineName }})</h3>
    <div v-if="Object.keys(gtoDebugInfo).length > 0" class="debug-info">
      <div class="debug-row">
        <span class="label">决策时间:</span>
        <span class="value">{{ gtoDebugInfo.timestamp }}</span>
      </div>
      <div class="debug-row">
        <span class="label">游戏阶段:</span>
        <span class="value">{{ gtoDebugInfo.gameStage }}</span>
      </div>
      <div class="debug-row">
        <span class="label">胜率:</span>
        <span class="value">{{ Math.round(gtoDebugInfo.winRate * 100) }}%</span>
      </div>
      <div class="debug-row">
        <span class="label">底池赔率:</span>
        <span class="value">{{ Math.round(gtoDebugInfo.potOdds * 100) }}%</span>
      </div>
      <div class="debug-row">
        <span class="label">期望值:</span>
        <span class="value" :class="{ positive: gtoDebugInfo.expectedValue > 0, negative: gtoDebugInfo.expectedValue < 0 }">
          {{ gtoDebugInfo.expectedValue > 0 ? '+' : '' }}{{ Math.round(gtoDebugInfo.expectedValue) }}
        </span>
      </div>
      <div class="debug-row">
        <span class="label">最优下注:</span>
        <span class="value">{{ Math.round(gtoDebugInfo.optimalBetSize) }}</span>
      </div>
      <div class="debug-row">
        <span class="label">是否诈唬:</span>
        <span class="value" :class="{ bluff: gtoDebugInfo.shouldBluff }">{{ gtoDebugInfo.shouldBluff ? '是' : '否' }}</span>
      </div>
      <div class="debug-row">
        <span class="label">AI行动:</span>
        <span class="value action">{{ gtoDebugInfo.action || '未知' }}</span>
      </div>
      <div class="debug-row">
        <span class="label">决策理由:</span>
        <span class="value reasoning">{{ gtoDebugInfo.reasoning || '分析中...' }}</span>
      </div>
      <div class="debug-row">
        <span class="label">决策信心:</span>
        <span class="value confidence">{{ gtoDebugInfo.confidence || 0 }}%</span>
      </div>
    </div>
    <div v-else class="no-debug-info">
      等待电脑玩家行动...
    </div>
  </div>
</template>

<script>
export default {
  name: 'AIDebugPanel',
  props: {
    showGTODebug: Boolean,
    gtoDebugInfo: Object,
    aiEngineName: String
  }
}
</script>

<style scoped>
.gto-debug-panel {
  background: linear-gradient(135deg, #2d3436, #636e72) !important;
  border-radius: 15px !important;
  padding: 20px !important;
  margin-top: 20px !important;
  color: white !important;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.gto-debug-panel h3 {
  margin: 0 0 20px 0;
  text-align: center;
  color: #74b9ff;
  font-size: 1.2em;
}

.debug-info {
  display: grid;
  gap: 12px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.debug-row:hover {
  background: rgba(255, 255, 255, 0.15);
}

.label {
  font-weight: 600;
  color: #ddd;
  min-width: 100px;
}

.value {
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.positive {
  color: #00b894;
}

.negative {
  color: #e17055;
}

.bluff {
  color: #fdcb6e;
  font-weight: bold;
}

.action {
  color: #74b9ff;
  font-weight: bold;
  text-transform: uppercase;
}

.reasoning {
  color: #a29bfe;
  font-style: italic;
  max-width: 200px;
  word-wrap: break-word;
}

.confidence {
  color: #fd79a8;
  font-weight: bold;
}

.no-debug-info {
  text-align: center;
  color: #b2bec3;
  font-style: italic;
  padding: 20px;
}

@media (max-width: 768px) {
  .debug-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .label {
    min-width: auto;
  }
  
  .value {
    text-align: left;
  }
}
</style>