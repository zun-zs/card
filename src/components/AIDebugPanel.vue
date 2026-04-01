<template>
  <div v-if="showGTODebug" class="gto-debug-panel">
    <h3>GTO 决策分析 ({{ aiEngineName }})</h3>
    <div v-if="debugInfo && Object.keys(debugInfo).length > 0" class="debug-info">
      <!-- 街道 -->
      <div class="debug-row">
        <span class="label">街道:</span>
        <span class="value">{{ debugInfo.street || gtoDebugInfo.gameStage || '-' }}</span>
      </div>

      <!-- 手牌名（翻前） -->
      <div v-if="debugInfo.handName" class="debug-row">
        <span class="label">手牌:</span>
        <span class="value hand-name">{{ debugInfo.handName }}</span>
      </div>

      <!-- 场景（翻前） -->
      <div v-if="debugInfo.scenario" class="debug-row">
        <span class="label">场景:</span>
        <span class="value">{{ debugInfo.scenario }}</span>
      </div>

      <!-- 胜率（翻后） -->
      <div v-if="debugInfo.winRate != null" class="debug-row">
        <span class="label">权益:</span>
        <span class="value">{{ debugInfo.winRate }}%</span>
      </div>

      <!-- 底池赔率 -->
      <div v-if="debugInfo.potOdds != null" class="debug-row">
        <span class="label">底池赔率:</span>
        <span class="value">{{ debugInfo.potOdds }}%</span>
      </div>

      <!-- MDF -->
      <div v-if="debugInfo.mdf != null" class="debug-row">
        <span class="label">MDF:</span>
        <span class="value">{{ debugInfo.mdf }}%</span>
      </div>

      <!-- 板面纹理 -->
      <div v-if="debugInfo.boardTexture" class="debug-row">
        <span class="label">板面:</span>
        <span class="value texture" :class="debugInfo.boardTexture">{{ textureLabel(debugInfo.boardTexture) }}</span>
      </div>

      <!-- 街道策略 -->
      <div v-if="debugInfo.streetStrategy" class="debug-row">
        <span class="label">策略:</span>
        <span class="value reasoning">{{ debugInfo.streetStrategy }}</span>
      </div>

      <!-- 动作概率分布 -->
      <div v-if="debugInfo.distribution" class="debug-row dist-row">
        <span class="label">分布:</span>
        <div class="dist-bars">
          <div
            v-for="(pct, act) in debugInfo.distribution"
            :key="act"
            class="dist-bar-wrapper"
          >
            <div class="dist-bar" :class="act" :style="{ width: pct + '%' }"></div>
            <span class="dist-label">{{ act }} {{ pct }}%</span>
          </div>
        </div>
      </div>

      <!-- AI行动 -->
      <div class="debug-row">
        <span class="label">行动:</span>
        <span class="value action">{{ gtoDebugInfo.action || '-' }}</span>
      </div>

      <!-- 理由 -->
      <div class="debug-row">
        <span class="label">理由:</span>
        <span class="value reasoning">{{ gtoDebugInfo.reasoning || '-' }}</span>
      </div>
    </div>
    <div v-else class="no-debug-info">
      等待电脑玩家行动...
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showGTODebug: Boolean,
  gtoDebugInfo: Object,
  aiEngineName: String,
})

const debugInfo = computed(() => props.gtoDebugInfo?.debugInfo || {})

const TEXTURE_LABELS = {
  dry: '干燥',
  wet: '湿润',
  monotone: '同花面',
  paired: '配对面',
  dynamic: '动态',
  unknown: '-',
}
function textureLabel(t) {
  return TEXTURE_LABELS[t] || t
}
</script>

<style scoped>
.gto-debug-panel {
  padding: 10px;
  background: linear-gradient(135deg, rgba(26, 31, 53, 0.95), rgba(42, 49, 80, 0.95));
  border-radius: 12px;
  border: 1px solid rgba(74, 158, 255, 0.25);
  color: white;
  height: 100%;
  overflow: hidden;
}

.gto-debug-panel h3 {
  margin: 0 0 10px 0;
  text-align: center;
  color: #4a9eff;
  font-size: 0.8rem;
  font-weight: 700;
}

.debug-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.debug-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: rgba(74, 158, 255, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(74, 158, 255, 0.12);
  font-size: 0.72rem;
  transition: background 0.2s ease;
}

.debug-row:hover {
  background: rgba(74, 158, 255, 0.2);
}

.label {
  font-weight: 600;
  color: #b8c5d6;
  min-width: 64px;
  font-size: 0.68rem;
}

.value {
  font-weight: 600;
  text-align: right;
  flex: 1;
  font-size: 0.72rem;
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
  font-size: 0.68rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.confidence {
  color: #27ae60;
  font-weight: bold;
}

.hand-name {
  color: #fbbf24;
  font-weight: bold;
  font-size: 0.82rem;
}

.texture.dry { color: #a3e635; }
.texture.wet { color: #38bdf8; }
.texture.monotone { color: #c084fc; }
.texture.paired { color: #fb923c; }
.texture.dynamic { color: #f87171; }

.dist-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
}

.dist-bars {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dist-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dist-bar {
  height: 8px;
  border-radius: 4px;
  min-width: 2px;
  transition: width 0.3s ease;
}

.dist-bar.raise, .dist-bar.open, .dist-bar.threebet, .dist-bar.fourbet {
  background: #ef4444;
}

.dist-bar.call {
  background: #22c55e;
}

.dist-bar.check {
  background: #3b82f6;
}

.dist-bar.fold {
  background: #6b7280;
}

.dist-label {
  font-size: 0.62rem;
  color: #94a3b8;
  white-space: nowrap;
}

.no-debug-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  padding: 12px;
  font-size: 0.75rem;
}
</style>