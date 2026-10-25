<script setup>
/**
 * 分页器
 * 知识点：
 *  - 组件 v-model（defineModel）双向绑定当前页
 *  - computed 生成页码数组（含省略号逻辑）
 *  - 数组方法 slice / 循环
 */
import { computed } from 'vue'

const page = defineModel({ type: Number, default: 1 })

const props = defineProps({
  total: { type: Number, required: true }, // 总页数
  /** 最多显示几个页码按钮 */
  window: { type: Number, default: 5 },
})

const emit = defineEmits(['change'])

/** 生成形如 [1, '...', 4, 5, 6, '...', 12] 的页码序列 */
const pages = computed(() => {
  const total = props.total
  const cur = page.value
  if (total <= props.window + 2) return Array.from({ length: total }, (_, i) => i + 1)

  const list = [1]
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  if (start > 2) list.push('...')
  for (let i = start; i <= end; i++) list.push(i)
  if (end < total - 1) list.push('...')
  list.push(total)
  return list
})

function go(p) {
  if (p === '...' || p === page.value) return
  const next = Math.min(Math.max(1, p), props.total)
  page.value = next
  emit('change', next)
}

const canPrev = computed(() => page.value > 1)
const canNext = computed(() => page.value < props.total)
</script>

<template>
  <div v-if="total > 1" class="pager">
    <button class="pager__btn" :disabled="!canPrev" @click="go(page - 1)">‹ 上一页</button>

    <button
      v-for="(p, idx) in pages"
      :key="`${p}-${idx}`"
      class="pager__btn"
      :class="{ 'is-active': p === page, 'is-dots': p === '...' }"
      :disabled="p === '...'"
      @click="go(p)"
    >
      {{ p }}
    </button>

    <button class="pager__btn" :disabled="!canNext" @click="go(page + 1)">下一页 ›</button>

    <span class="pager__info small muted">第 {{ page }} / {{ total }} 页</span>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 26px;
  flex-wrap: wrap;
}

.pager__btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  font-size: 13.5px;
  color: var(--text-muted);
  transition: all 0.2s var(--ease);
}

.pager__btn:hover:not(:disabled) {
  border-color: var(--brand);
  color: var(--brand-strong);
}

.pager__btn.is-active {
  background: var(--brand);
  border-color: transparent;
  color: #fff;
  font-weight: 700;
}

.pager__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pager__btn.is-dots {
  border: none;
  background: transparent;
  opacity: 0.7;
}

.pager__info {
  margin-left: 8px;
}
</style>