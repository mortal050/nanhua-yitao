<script setup>
/**
 * 平台特色 & 分类均价图表
 * 知识点：
 *  - v-for 渲染配置数组
 *  - 动态 style 计算柱状图宽度（把数据映射为视觉）
 *  - 动态组件 <component :is> 演示：在「特色卡片 / 均价榜」两种视图间切换
 */
import { computed, ref } from 'vue'
import { FEATURES } from '@/data/items'
import { useMarketStore } from '@/stores/market'
import { useCurrency } from '@/composables'

const market = useMarketStore()
const money = useCurrency()

const tab = ref('feature') // feature | price
const TABS = [
  { key: 'feature', label: '平台特色', icon: '✨' },
  { key: 'price', label: '分类均价', icon: '📈' },
]

const maxAvg = computed(() => Math.max(...market.priceByCategory.map((c) => c.avg), 1))
const widthOf = (avg) => `${Math.max(6, Math.round((avg / maxAvg.value) * 100))}%`
</script>

<template>
  <section class="panel">
    <div class="row-between wrap" style="margin-bottom: 16px">
      <h3 class="section-title" style="margin: 0">逛逛南华易淘</h3>
      <div class="tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="tabs__btn"
          :class="{ 'is-on': tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.icon }} {{ t.label }}
        </button>
      </div>
    </div>

    <!-- v-if / v-else 条件渲染两块内容（动态组件的用法见 Vue 实验室） -->
    <div class="content">
      <div v-if="tab === 'feature'" class="features">
        <div v-for="f in FEATURES" :key="f.title" class="feature">
          <span class="feature__icon">{{ f.icon }}</span>
          <div>
            <strong>{{ f.title }}</strong>
            <p class="small muted">{{ f.desc }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bars">
        <div v-for="c in market.priceByCategory" :key="c.id" class="bar">
          <span class="bar__name">{{ c.icon }} {{ c.name }}</span>
          <div class="bar__track">
            <div class="bar__fill" :style="{ width: widthOf(c.avg), background: c.color }" />
          </div>
          <span class="bar__value">{{ money(c.avg) }}<em class="muted small"> / 均价</em></span>
          <span class="tag">{{ c.count }} 件</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 6px;
  background: var(--bg-sunken);
  padding: 4px;
  border-radius: 999px;
}

.tabs__btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.tabs__btn.is-on {
  background: var(--bg-elevated);
  color: var(--brand-strong);
  box-shadow: var(--shadow-sm);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
}

.feature {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
}

.feature__icon {
  font-size: 22px;
}

.feature p {
  margin: 2px 0 0;
}

.bars {
  display: grid;
  gap: 12px;
}

.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.bar__name {
  width: 108px;
  flex-shrink: 0;
  color: var(--text-muted);
}

.bar__track {
  flex: 1;
  height: 12px;
  border-radius: 999px;
  background: var(--bg-sunken);
  overflow: hidden;
}

.bar__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s var(--ease);
}

.bar__value {
  width: 118px;
  text-align: right;
}

.bar__value em {
  font-style: normal;
}
</style>