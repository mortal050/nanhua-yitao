<script setup>
/**
 * 平台动态时间轴（异步组件）
 * 被 HomeView 通过 defineAsyncComponent 懒加载，
 * 所以这个组件的代码只会在用户点击「展开平台动态」后才下载执行。
 * 知识点：异步组件 + Suspense、v-for 渲染时间轴
 */
import { computed } from 'vue'
import { useMarketStore } from '@/stores/market'
import { useRelativeTime } from '@/composables'

const market = useMarketStore()
const fromNow = useRelativeTime()

/** 把最近发布的商品当作「平台动态」来展示 */
const events = computed(() =>
  market.latestItems.slice(0, 5).map((it, i) => ({
    id: it.id,
    title: `${it.seller.name} 发布了《${it.title}》`,
    desc: `${it.condition} · ${it.spot}`,
    time: it.publishedAt,
    icon: ['📦', '🎉', '🔔', '✨', '🛒'][i % 5],
  }))
)
</script>

<template>
  <div class="timeline">
    <div v-for="e in events" :key="e.id" class="timeline__item">
      <span class="timeline__dot">{{ e.icon }}</span>
      <div class="timeline__body">
        <strong>{{ e.title }}</strong>
        <p class="small muted">{{ e.desc }} · {{ fromNow(e.time) }}</p>
      </div>
    </div>
    <p class="small muted center">以上为异步加载组件渲染的内容 ✨</p>
  </div>
</template>

<style scoped>
.timeline {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed var(--border);
  display: grid;
  gap: 12px;
}

.timeline__item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline__dot {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--brand-soft);
  font-size: 15px;
}

.timeline__body p {
  margin: 2px 0 0;
}
</style>