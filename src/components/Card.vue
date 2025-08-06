<template>
  <div class="card" :class="{ 'card-hidden': hidden }">
    <div class="card-front" :class="[suitClass, cardColor]">
      <div class="card-corner top-left">
        <div class="card-rank">{{ displayRank }}</div>
        <div class="card-suit">{{ suitSymbol }}</div>
      </div>
      
      <!-- 非数字牌（A、J、Q、K）显示大图标 -->
      <div class="card-center" v-if="!isNumber">
        <span v-if="displayRank === 'A'">{{ suitSymbol }}</span>
        <span v-else-if="displayRank === 'J'">J</span>
        <span v-else-if="displayRank === 'Q'">Q</span>
        <span v-else-if="displayRank === 'K'">K</span>
      </div>
      
      <!-- 数字牌显示多个小图标 -->
      <div class="card-center" v-else>
        <template v-for="n in pipCount" :key="n">
          <div class="card-pip" v-if="shouldShowPip(n)">
            {{ suitSymbol }}
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
    
    // 计算需要显示的点数数量
    const pipCount = computed(() => {
      return isNumber.value ? 10 : 0 // 固定为10个位置，通过shouldShowPip控制显示
    })
    
    // 根据牌的点数和位置决定是否显示某个点
    const shouldShowPip = (position) => {
      const rank = Number(props.card.rank)
      
      // 根据不同的点数决定显示哪些位置的点
      switch (rank) {
        case 2:
          return position === 1 || position === 9 // 上左和下右
        case 3:
          return position === 1 || position === 5 || position === 9 // 上左、中间和下右
        case 4:
          return position === 1 || position === 2 || position === 8 || position === 9 // 四角
        case 5:
          return position === 1 || position === 2 || position === 5 || position === 8 || position === 9 // 四角加中间
        case 6:
          return position === 1 || position === 2 || position === 3 || position === 7 || position === 8 || position === 9 // 两列三点
        case 7:
          return position === 1 || position === 2 || position === 3 || position === 5 || position === 7 || position === 8 || position === 9 // 两列三点加中间
        case 8:
          return position === 1 || position === 2 || position === 3 || position === 4 || position === 6 || position === 7 || position === 8 || position === 9 // 两列四点
        case 9:
          return position === 1 || position === 2 || position === 3 || position === 4 || position === 5 || position === 6 || position === 7 || position === 8 || position === 9 // 两列四点加中间
        case 10:
          return position <= 10 // 所有点
        default:
          return false
      }
    }
    
    return {
      suitSymbol,
      suitClass,
      cardColor,
      displayRank,
      isNumber,
      pipCount,
      shouldShowPip
    }
  }
}
</script>

<style scoped>
/* 可以添加组件特定的样式 */
</style>