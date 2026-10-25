<script setup>
/**
 * 全局轻提示容器
 * 知识点：
 *  - <Teleport to="body"> 把节点传送到 body 下，避免被祖先的 overflow/transform 影响
 *  - <TransitionGroup> 列表过渡（进入/离开动画 + 移动动画）
 *  - 从插件模块导入响应式数组，实现跨组件通信
 */
import { dismiss, toasts } from '@/plugins/notify'

const ICONS = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '⛔' }
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-host">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${toast.type}`"
        role="status"
        @click="dismiss(toast.id)"
      >
        <span class="toast__icon">{{ ICONS[toast.type] || 'ℹ️' }}</span>
        <span class="toast__msg">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 78px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 230px;
  max-width: 340px;
  padding: 11px 16px;
  border-radius: var(--radius);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  cursor: pointer;
  pointer-events: auto;
  font-size: 13.5px;
}

.toast--success {
  border-left: 4px solid var(--brand);
}

.toast--warn {
  border-left: 4px solid var(--accent);
}

.toast--error {
  border-left: 4px solid var(--danger);
}

.toast__icon {
  font-size: 15px;
}

/* TransitionGroup 过渡：进场从右侧滑入，离场淡出 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.32s var(--ease);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.96);
}

.toast-leave-active {
  position: absolute;
}
</style>