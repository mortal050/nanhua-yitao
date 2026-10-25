<script setup>
/**
 * 空状态占位
 * 知识点：具名插槽 + 插槽后备内容（父组件不传 action 时显示默认按钮）
 */
defineProps({
  icon: { type: String, default: '🗂️' },
  title: { type: String, default: '这里什么都没有' },
  desc: { type: String, default: '' },
})
</script>

<template>
  <div class="empty">
    <div class="empty__icon">{{ icon }}</div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="desc" class="empty__desc muted">{{ desc }}</p>
    <div class="empty__action">
      <!-- 默认插槽：父组件可以塞按钮进去 -->
      <slot>
        <RouterLink class="btn btn-primary" :to="{ name: 'market' }">去市场逛逛</RouterLink>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 54px 20px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-elevated);
}

.empty__icon {
  font-size: 44px;
  margin-bottom: 12px;
  filter: grayscale(0.15);
}

.empty__title {
  font-size: 17px;
  margin-bottom: 6px;
}

.empty__desc {
  font-size: 13.5px;
  margin: 0 0 18px;
}
</style>