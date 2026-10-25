<script setup>
/**
 * 评论列表
 * 知识点：
 *  - 具名 + 作用域插槽
 *  - v-if / v-else 分支、v-for 渲染、key 的重要性
 *  - computed 派生（平均分）
 *  - inject 读取全局 notify（来自自定义插件）
 */
import { computed, inject } from 'vue'
import StarRating from '@/components/common/StarRating.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useRelativeTime } from '@/composables'

const props = defineProps({
  comments: { type: Array, default: () => [] },
  itemId: { type: String, default: '' },
})

const emit = defineEmits(['reply', 'like'])

const notify = inject('notify', () => {})
const fromNow = useRelativeTime()

const average = computed(() => {
  if (!props.comments.length) return 0
  const sum = props.comments.reduce((s, c) => s + (c.rating || 5), 0)
  return Math.round((sum / props.comments.length) * 10) / 10
})
</script>

<template>
  <section class="comments">
    <header class="comments__head">
      <h3>交易评价 <span class="muted small">（{{ comments.length }} 条）</span></h3>
      <div v-if="comments.length" class="comments__avg">
        <StarRating :model-value="Math.round(average)" readonly size="14px" />
        <strong>{{ average }}</strong>
        <span class="muted small">平均分</span>
      </div>
    </header>

    <EmptyState
      v-if="!comments.length"
      icon="💬"
      title="还没有人评价"
      desc="确认收货后就可以留下你的第一条评价啦"
    >
      <span class="tag">成为第一个评价的人</span>
    </EmptyState>

    <ul v-else class="comments__list">
      <li v-for="c in comments" :key="c.id" class="comment">
        <div class="comment__avatar">{{ c.avatar || '🙂' }}</div>
        <div class="comment__body">
          <div class="comment__top">
            <strong>{{ c.author }}</strong>
            <StarRating :model-value="c.rating || 5" readonly size="13px" />
            <span class="muted small">{{ fromNow(c.time) }}</span>
          </div>
          <p class="comment__text">{{ c.content }}</p>
          <div class="comment__actions">
            <!-- 具名插槽：允许父组件在每条评论下插入额外操作 -->
            <slot name="actions" :comment="c">
              <button class="link" @click="emit('like', c)">👍 有用</button>
              <button class="link" @click="emit('reply', c)">回复</button>
            </slot>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.comments__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.comments__head h3 {
  font-size: 16px;
}

.comments__avg {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}

.comments__avg strong {
  color: var(--accent);
  font-size: 16px;
}

.comments__list {
  display: grid;
  gap: 14px;
}

.comment {
  display: flex;
  gap: 12px;
  padding: 13px 15px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
}

.comment__avatar {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bg-elevated);
  font-size: 18px;
  border: 1px solid var(--border);
}

.comment__body {
  flex: 1;
  min-width: 0;
}

.comment__top {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.comment__text {
  margin: 6px 0 8px;
  font-size: 13.5px;
  line-height: 1.7;
}

.comment__actions {
  display: flex;
  gap: 14px;
}

.link {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12.5px;
  cursor: pointer;
  padding: 0;
}

.link:hover {
  color: var(--brand-strong);
}
</style>