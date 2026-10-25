<script setup>
/**
 * 收藏按钮
 * 知识点：
 *  - 直接与 Pinia store 交互（action / getter）
 *  - inject 使用插件提供的 notify（不在模板里用 $notify，展示两种用法）
 *  - 事件修饰符 .stop 阻止冒泡（卡片整体可点击，按钮不触发跳转）
 *  - <Transition> 切换图标
 */
import { computed, inject } from 'vue'
import { useMarketStore } from '@/stores/market'

const props = defineProps({
  itemId: { type: String, required: true },
  /** icon：圆形图标按钮；text：带文字的按钮 */
  variant: { type: String, default: 'icon' },
})

const market = useMarketStore()
const notify = inject('notify')

const active = computed(() => market.isFavorite(props.itemId))

function toggle() {
  const added = market.toggleFavorite(props.itemId)
  notify(added ? '已加入收藏 ❤️' : '已取消收藏', added ? 'success' : 'info', 1600)
}
</script>

<template>
  <button
    class="fav-btn"
    :class="[`fav-btn--${variant}`, { 'is-on': active }]"
    :title="active ? '取消收藏' : '收藏'"
    @click.stop="toggle"
  >
    <Transition name="swap" mode="out-in">
      <span :key="String(active)">{{ active ? '❤️' : '🤍' }}</span>
    </Transition>
    <span v-if="variant === 'text'">{{ active ? '已收藏' : '收藏' }}</span>
  </button>
</template>

<style scoped>
.fav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.fav-btn--icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 16px;
}

.fav-btn--text {
  padding: 9px 18px;
  border-radius: 999px;
  font-weight: 600;
}

.fav-btn:hover {
  border-color: var(--danger);
  transform: translateY(-1px);
}

.fav-btn.is-on {
  border-color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
}

.swap-enter-active,
.swap-leave-active {
  transition: all 0.18s var(--ease);
}

.swap-enter-from {
  opacity: 0;
  transform: scale(0.4) rotate(-25deg);
}

.swap-leave-to {
  opacity: 0;
  transform: scale(1.4);
}
</style>