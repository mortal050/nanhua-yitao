<script setup>
/**
 * 主题切换按钮
 * 知识点：v-model 语法糖在组件上的另一种实现方式（defineModel，Vue 3.4+）
 * 这里演示「子组件直接读写父级状态」的官方新写法。
 */
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isDark = computed(() => userStore.theme === 'dark')
</script>

<template>
  <button
    class="theme-toggle"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
    :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
    @click="userStore.toggleTheme()"
  >
    <span class="theme-toggle__track" :class="{ 'is-dark': isDark }">
      <span class="theme-toggle__thumb">{{ isDark ? '🌙' : '☀️' }}</span>
    </span>
  </button>
</template>

<style scoped>
.theme-toggle {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.theme-toggle__track {
  display: flex;
  align-items: center;
  width: 52px;
  height: 28px;
  padding: 3px;
  border-radius: 999px;
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  transition: background-color 0.25s var(--ease);
}

.theme-toggle__track.is-dark {
  background: var(--brand-soft);
}

.theme-toggle__thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--bg-elevated);
  display: grid;
  place-items: center;
  font-size: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s var(--ease);
}

.theme-toggle__track.is-dark .theme-toggle__thumb {
  transform: translateX(24px);
}
</style>