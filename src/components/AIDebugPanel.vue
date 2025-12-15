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
  padding: 12px;
  background: linear-gradient(135deg, rgba(26, 31, 53, 0.95), rgba(42, 49, 80, 0.95));
  border-radius: 10px;
  border: 1px solid rgba(74, 158, 255, 0.3);
  color: white;
  height: 100%;
  overflow-y: auto;
}

.gto-debug-panel h3 {
  margin: 0 0 10px 0;
  text-align: center;
  color: #4a9eff;
  font-size: 0.85rem;
  font-weight: 700;
}

.debug-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 5px;
  border: 1px solid rgba(74, 158, 255, 0.15);
  font-size: 0.75rem;
  transition: background 0.2s ease;
}

.debug-row:hover {
  background: rgba(74, 158, 255, 0.2);
}

.label {
  font-weight: 600;
  color: #b8c5d6;
  min-width: 70px;
  font-size: 0.7rem;
}

.value {
  font-weight: 600;
  text-align: right;
  flex: 1;
  font-size: 0.75rem;
  color: #fff;
}

.positive {
  color: #4ade80;
}

.negative {
  color: #f87171;
}

.bluff {
  color: #fbbf24;
  font-weight: bold;
}

.action {
  color: #a78bfa;
  font-weight: bold;
  text-transform: uppercase;
}

.reasoning {
  color: #f39c12;
  font-style: italic;
  max-width: 150px;
  word-wrap: break-word;
  font-size: 0.7rem;
}

.confidence {
  color: #27ae60;
  font-weight: bold;
}

.no-debug-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 15px;
  font-size: 0.8rem;
}
</style>