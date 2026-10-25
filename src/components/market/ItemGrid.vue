<script setup>
/**
 * 商品网格 / 列表容器
 * 知识点：
 *  - 作用域插槽：把每个 item 通过 <slot :item="item"> 暴露给父组件自定义渲染
 *  - <TransitionGroup> 列表增删动画
 *  - 透传 attribute：v-bind="$attrs" 配合 inheritAttrs: false 手动决定属性落点
 */
import ItemCard from '@/components/market/ItemCard.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  items: { type: Array, default: () => [] },
  mode: { type: String, default: 'grid' },
  keyword: { type: String, default: '' },
  favoriteIds: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-favorite', 'open'])
</script>

<template>
  <div class="grid-wrap" :class="`grid-wrap--${mode}`" v-bind="$attrs">
    <TransitionGroup name="card" tag="div" class="cards">
      <ItemCard
        v-for="item in props.items"
        :key="item.id"
        :item="item"
        :mode="mode"
        :keyword="keyword"
        :favorite="favoriteIds.includes(item.id)"
        @toggle-favorite="emit('toggle-favorite', $event)"
        @open="emit('open', $event)"
      />
    </TransitionGroup>

    <!-- 作用域插槽：把统计结果回传给父组件，父组件可自行决定展示什么 -->
    <slot name="summary" :count="props.items.length" :mode="mode" />
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
}

.grid-wrap--list .cards {
  grid-template-columns: 1fr;
}

/* TransitionGroup：卡片进入 / 移动的过渡 */
.card-enter-active,
.card-leave-active,
.card-move {
  transition: all 0.35s var(--ease);
}

.card-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}

.card-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

.card-leave-active {
  position: absolute;
  width: 228px;
}
</style>