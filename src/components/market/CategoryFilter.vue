<script setup>
/**
 * 分类筛选器
 * 知识点：
 *  - 与 Pinia store 直接双向绑定：computed 的 get/set 写法
 *  - v-for 渲染分类、动态 class
 *  - 用 computed 从 store 派生计数
 */
import { computed } from 'vue'
import { CATEGORIES } from '@/data/categories'
import { useMarketStore } from '@/stores/market'

const market = useMarketStore()

defineProps({
  /** chips：横排标签；sidebar：竖向列表 */
  layout: { type: String, default: 'chips' },
})

const allCategories = computed(() => [{ id: 'all', name: '全部', icon: '✨' }, ...CATEGORIES])

/** computed 的 setter：配合 v-model 使用 */
const current = computed({
  get: () => market.category,
  set: (val) => {
    market.category = val
  },
})

function countOf(id) {
  return market.categoryCounts[id] ?? 0
}
</script>

<template>
  <nav class="cats" :class="`cats--${layout}`">
    <button
      v-for="cat in allCategories"
      :key="cat.id"
      class="cats__item"
      :class="{ 'is-active': current === cat.id }"
      :style="{ '--cat-color': cat.color || 'var(--brand)' }"
      @click="current = cat.id"
    >
      <span class="cats__icon">{{ cat.icon }}</span>
      <span class="cats__name">{{ cat.name }}</span>
      <span class="cats__count">{{ countOf(cat.id) }}</span>
    </button>
  </nav>
</template>

<style scoped>
.cats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cats--sidebar {
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 4px;
}

.cats__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.2s var(--ease);
}

.cats--sidebar .cats__item {
  border-radius: var(--radius-sm);
  width: 100%;
  text-align: left;
}

.cats__item:hover {
  color: var(--text);
  border-color: color-mix(in srgb, var(--cat-color) 50%, var(--border));
  transform: translateX(2px);
}

.cats__item.is-active {
  color: #fff;
  background: var(--cat-color);
  border-color: transparent;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--cat-color) 45%, transparent);
}

.cats__count {
  margin-left: auto;
  font-size: 11.5px;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--bg-sunken);
  color: var(--text-muted);
}

.cats__item.is-active .cats__count {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}
</style>