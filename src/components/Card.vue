<template>
  <div class="card" :class="{ 'card-hidden': hidden }">
    <div class="card-front" :class="[suitClass, cardColor]">
      <div class="card-corner top-left">
        <div class="card-rank">{{ displayRank }}</div>
        <div class="card-suit">{{ suitSymbol }}</div>
      </div>
      
      <!-- 中心区域 -->
      <div class="card-center" :class="cardColor">
        <!-- A、J、Q、K 显示单个大图标或字母 -->
        <template v-if="!isNumber">
          <span class="face-card">{{ displayRank === 'A' ? suitSymbol : displayRank }}</span>
        </template>
        
        <!-- 数字牌显示花色点阵 -->
        <template v-else>
          <div class="pip-container" :class="'pip-' + card.rank">
            <span v-for="n in Number(card.rank)" :key="n" class="pip">{{ suitSymbol }}</span>
          </div>
        </template>
      </div>
      
      <div class="card-corner bottom-right">
        <div class="card-rank">{{ displayRank }}</div>
        <div class="card-suit">{{ suitSymbol }}</div>
      </div>
    </div>
    <div class="card-back">
      <div class="card-pattern"></div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Card',
  props: {
    card: {
      type: Object,
      required: true
    },
    hidden: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const suitSymbol = computed(() => {
      switch (props.card.suit) {
        case 'hearts': return '♥'
        case 'diamonds': return '♦'
        case 'clubs': return '♣'
        case 'spades': return '♠'
        default: return ''
      }
    })
    
    const suitClass = computed(() => {
      return `suit-${props.card.suit}`
    })
    
    const cardColor = computed(() => {
      return ['hearts', 'diamonds'].includes(props.card.suit) ? 'red' : 'black'
    })
    
    const displayRank = computed(() => {
      switch (props.card.rank) {
        case '1': return 'A'
        case '11': return 'J'
        case '12': return 'Q'
        case '13': return 'K'
        default: return props.card.rank
      }
    })
    
    const isNumber = computed(() => {
      return !isNaN(Number(props.card.rank)) && 
             Number(props.card.rank) >= 2 && 
             Number(props.card.rank) <= 10
    })
    
    return {
      suitSymbol,
      suitClass,
      cardColor,
      displayRank,
      isNumber
    }
  }
}
</script>

<style scoped>
.card {
  width: var(--card-width, 70px);
  height: var(--card-height, 98px);
  perspective: 1000px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.card:hover {
  transform: translateY(-5px) scale(1.03);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.card-front {
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  position: relative;
  z-index: 2;
}

.card-back {
  background: linear-gradient(135deg, #1a1f35 0%, #2a3150 100%);
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(74, 158, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 107, 157, 0.3) 0%, transparent 50%),
    repeating-linear-gradient(
      45deg,
      rgba(74, 158, 255, 0.1) 0px,
      rgba(74, 158, 255, 0.1) 2px,
      transparent 2px,
      transparent 10px
    );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.card-back::before {
  content: '♠♥♣♦';
  color: rgba(255, 255, 255, 0.3);
  font-size: 1rem;
  letter-spacing: 2px;
}

/* 隐藏牌时显示背面 */
.card-hidden .card-front {
  display: none;
}

.card-hidden .card-back {
  z-index: 2;
}

/* 角落数字和花色 */
.card-corner {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  line-height: 1;
}

.top-left {
  top: 3px;
  left: 4px;
}

.bottom-right {
  bottom: 3px;
  right: 4px;
  transform: rotate(180deg);
}

.card-rank {
  font-size: 0.9rem;
  font-weight: 900;
}

.card-suit {
  font-size: 0.7rem;
  margin-top: -2px;
}

/* 中心区域 */
.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 人头牌和A */
.face-card {
  font-size: 2rem;
  font-weight: 900;
}

/* 花色点阵容器 */
.pip-container {
  width: 100%;
  height: 100%;
  display: grid;
  justify-items: center;
  align-items: center;
}

.pip {
  font-size: 0.75rem;
  line-height: 1;
}

/* 2点 - 上下两个 */
.pip-2 {
  grid-template-rows: 1fr 1fr;
}

/* 3点 - 上中下 */
.pip-3 {
  grid-template-rows: 1fr 1fr 1fr;
}

/* 4点 - 2x2网格 */
.pip-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

/* 5点 - 2x2网格 + 中心 */
.pip-5 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}
.pip-5 .pip:nth-child(5) {
  grid-column: 1 / 3;
}
.pip-5 .pip:nth-child(1) { grid-row: 1; grid-column: 1; }
.pip-5 .pip:nth-child(2) { grid-row: 1; grid-column: 2; }
.pip-5 .pip:nth-child(3) { grid-row: 3; grid-column: 1; }
.pip-5 .pip:nth-child(4) { grid-row: 3; grid-column: 2; }
.pip-5 .pip:nth-child(5) { grid-row: 2; grid-column: 1 / 3; }

/* 6点 - 2x3网格 */
.pip-6 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}

/* 7点 - 2x3网格 + 中上 */
.pip-7 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
}
.pip-7 .pip:nth-child(1) { grid-row: 1; grid-column: 1; }
.pip-7 .pip:nth-child(2) { grid-row: 1; grid-column: 2; }
.pip-7 .pip:nth-child(3) { grid-row: 2; grid-column: 1; }
.pip-7 .pip:nth-child(4) { grid-row: 2; grid-column: 2; }
.pip-7 .pip:nth-child(5) { grid-row: 3; grid-column: 1; }
.pip-7 .pip:nth-child(6) { grid-row: 3; grid-column: 2; }
.pip-7 .pip:nth-child(7) { grid-row: 4; grid-column: 1 / 3; }

/* 8点 - 2x4网格 */
.pip-8 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
}

/* 9点 - 3x3网格 */
.pip-9 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}
.pip-9 .pip:nth-child(1) { grid-row: 1; grid-column: 1; }
.pip-9 .pip:nth-child(2) { grid-row: 1; grid-column: 3; }
.pip-9 .pip:nth-child(3) { grid-row: 2; grid-column: 1; }
.pip-9 .pip:nth-child(4) { grid-row: 2; grid-column: 2; }
.pip-9 .pip:nth-child(5) { grid-row: 2; grid-column: 3; }
.pip-9 .pip:nth-child(6) { grid-row: 3; grid-column: 1; }
.pip-9 .pip:nth-child(7) { grid-row: 3; grid-column: 2; }
.pip-9 .pip:nth-child(8) { grid-row: 3; grid-column: 3; }
.pip-9 .pip:nth-child(9) { grid-row: 1; grid-column: 2; }

/* 10点 - 特殊布局 */
.pip-10 {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(4, 1fr);
  font-size: 0.65rem;
}
.pip-10 .pip:nth-child(1) { grid-row: 1; grid-column: 1; }
.pip-10 .pip:nth-child(2) { grid-row: 1; grid-column: 3; }
.pip-10 .pip:nth-child(3) { grid-row: 2; grid-column: 1; }
.pip-10 .pip:nth-child(4) { grid-row: 2; grid-column: 3; }
.pip-10 .pip:nth-child(5) { grid-row: 3; grid-column: 1; }
.pip-10 .pip:nth-child(6) { grid-row: 3; grid-column: 3; }
.pip-10 .pip:nth-child(7) { grid-row: 4; grid-column: 1; }
.pip-10 .pip:nth-child(8) { grid-row: 4; grid-column: 3; }
.pip-10 .pip:nth-child(9) { grid-row: 1; grid-column: 2; align-self: end; }
.pip-10 .pip:nth-child(10) { grid-row: 4; grid-column: 2; align-self: start; }

/* 卡牌颜色 */
.red {
  color: #e74c3c;
}

.black {
  color: #2c3e50;
}
</style>