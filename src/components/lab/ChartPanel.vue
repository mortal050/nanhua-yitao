<script setup>
/**
 * 异步组件被加载的内容（体积较大 / 用得少，所以做成异步）
 * 知识点：配合 defineAsyncComponent + <Suspense> 使用；也可以用顶层 await 模拟请求
 */
import { useMarketStore } from '@/stores/market'

const market = useMarketStore()

// 顶层 await：让这个组件的 setup 变成异步，必须配合 <Suspense> 使用
await new Promise((resolve) => setTimeout(resolve, 900))

/** 用商品数据算出一个简单的分类占比图 */
const total = market.items.length
const rows = market.priceByCategory.map((c) => ({
  ...c,
  percent: Math.round((c.count / total) * 100),
}))
</script>

<template>
  <div class="chart">
    <p class="small muted">✅ 异步组件已加载完成（等待了约 0.9 秒，期间显示的是 Suspense 的 fallback 骨架屏）</p>
    <div class="chart__legend">
      <div v-for="r in rows" :key="r.id" class="chart__row">
        <span class="chart__name">{{ r.icon }} {{ r.name }}</span>
        <div class="chart__track">
          <div class="chart__fill" :style="{ width: r.percent + '%', background: r.color }" />
        </div>
        <span class="small muted">{{ r.count }} 件 · {{ r.percent }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart {
  margin-top: 16px;
  padding: 16px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
}

.chart__legend {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.chart__row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.chart__name {
  width: 110px;
  flex-shrink: 0;
  color: var(--text-muted);
}

.chart__track {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--bg-elevated);
  overflow: hidden;
}

.chart__fill {
  height: 100%;
  border-radius: 999px;
  animation: grow 0.8s var(--ease);
}

@keyframes grow {
  from {
    width: 0 !important;
  }
}
</style>