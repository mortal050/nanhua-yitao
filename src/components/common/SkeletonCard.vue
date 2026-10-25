<script setup>
/**
 * 骨架屏卡片（加载占位）
 * 知识点：props 校验 + 数组渲染 + CSS 动画（渐变扫光）
 */
defineProps({
  count: { type: Number, default: 4 },
})
</script>

<template>
  <div class="skeleton-grid">
    <div v-for="n in count" :key="n" class="skeleton">
      <div class="skeleton__cover" />
      <div class="skeleton__line skeleton__line--lg" />
      <div class="skeleton__line" />
      <div class="skeleton__line skeleton__line--sm" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
}

.skeleton {
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
}

.skeleton__cover {
  height: 130px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.skeleton__line {
  height: 12px;
  border-radius: 6px;
  margin-bottom: 8px;
  width: 100%;
}

.skeleton__line--lg {
  height: 16px;
  width: 80%;
}

.skeleton__line--sm {
  width: 45%;
}

.skeleton__cover,
.skeleton__line {
  background: linear-gradient(90deg, var(--bg-sunken) 25%, var(--border) 37%, var(--bg-sunken) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>