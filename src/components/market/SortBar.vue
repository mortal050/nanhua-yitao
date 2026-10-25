<script setup>
/**
 * 排序 + 价格区间 + 视图切换工具条
 * 知识点：
 *  - 多个 v-model（defineModel 具名：v-model:sort / v-model:view）
 *  - 复选框 v-model 绑定布尔值
 *  - 单选组（radio）v-model 绑定数组以外的普通值
 *  - 事件修饰符、动态 class
 */
import { useMarketStore } from '@/stores/market'

const market = useMarketStore()

const sort = defineModel('sort', { type: String, default: 'newest' })
const view = defineModel('view', { type: String, default: 'grid' })
const range = defineModel('range', { type: String, default: 'all' })
const negotiable = defineModel('negotiable', { type: Boolean, default: false })

const SORTS = [
  { value: 'newest', label: '最新发布', icon: '🕒' },
  { value: 'priceAsc', label: '价格从低到高', icon: '⬆️' },
  { value: 'priceDesc', label: '价格从高到低', icon: '⬇️' },
  { value: 'hot', label: '最多浏览', icon: '🔥' },
]

const RANGES = [
  { value: 'all', label: '不限' },
  { value: '0-50', label: '50 元以下' },
  { value: '50-200', label: '50 - 200' },
  { value: '200-1000', label: '200 - 1000' },
  { value: '1000+', label: '1000 以上' },
]

defineProps({
  resultCount: { type: Number, default: 0 },
})
</script>

<template>
  <div class="toolbar card">
    <div class="toolbar__left row wrap">
      <label class="toolbar__label small muted">排序</label>
      <select v-model="sort" class="select toolbar__select" @change="market.page = 1">
        <option v-for="s in SORTS" :key="s.value" :value="s.value">{{ s.icon }} {{ s.label }}</option>
      </select>

      <label class="toolbar__label small muted">价格</label>
      <select v-model="range" class="select toolbar__select">
        <option v-for="r in RANGES" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>

      <label class="check">
        <input v-model="negotiable" type="checkbox" />
        <span>只看可议价</span>
      </label>
    </div>

    <div class="toolbar__right row">
      <span class="small muted">共 {{ resultCount }} 件</span>
      <div class="segmented">
        <button :class="{ 'is-on': view === 'grid' }" title="网格视图" @click="view = 'grid'">▦</button>
        <button :class="{ 'is-on': view === 'list' }" title="列表视图" @click="view = 'list'">▤</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 11px 14px;
  flex-wrap: wrap;
}

.toolbar__left {
  gap: 10px;
}

.toolbar__select {
  width: auto;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 8px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--text-muted);
}

.check input {
  accent-color: var(--brand);
  width: 15px;
  height: 15px;
}

.segmented {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 9px;
  overflow: hidden;
}

.segmented button {
  width: 32px;
  height: 30px;
  border: none;
  background: var(--bg-elevated);
  cursor: pointer;
  color: var(--text-muted);
}

.segmented button.is-on {
  background: var(--brand-soft);
  color: var(--brand-strong);
}
</style>