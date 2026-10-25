<script setup>
/**
 * 通用对话框
 * 知识点：
 *  - 具名插槽（header / default / footer）
 *  - defineModel 实现 v-model="visible"（Vue 3.4+ 官方推荐写法）
 *  - Teleport 传送到 body
 *  - watch 侦听开关状态控制 body 滚动锁定
 *  - emits 自定义事件
 */
import { onUnmounted, watch } from 'vue'

const visible = defineModel({ type: Boolean, default: false })

const props = defineProps({
  title: { type: String, default: '提示' },
  width: { type: String, default: '520px' },
  closeOnMask: { type: Boolean, default: true },
})

const emit = defineEmits(['open', 'close', 'confirm'])

watch(visible, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  emit(val ? 'open' : 'close')
})

onUnmounted(() => (document.body.style.overflow = ''))

function close() {
  visible.value = false
}

function onMaskClick() {
  if (props.closeOnMask) close()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="mask" @click.self="onMaskClick">
        <div class="modal" :style="{ width }" role="dialog" aria-modal="true">
          <!-- 具名插槽：头部 -->
          <header class="modal__head">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="modal__close" aria-label="关闭" @click="close">✕</button>
          </header>

          <!-- 默认插槽：主体内容 -->
          <div class="modal__body">
            <slot />
          </div>

          <!-- 具名插槽：底部，用 $slots 判断父组件有没有传，没传就不渲染 -->
          <footer v-if="$slots.footer" class="modal__foot">
            <slot name="footer" :close="close" :confirm="() => emit('confirm')" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 24, 20, 0.5);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  z-index: 200;
  padding: 20px;
}

.modal {
  max-width: 100%;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
}

.modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.modal__head h3 {
  font-size: 16px;
}

.modal__close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-muted);
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.modal__close:hover {
  background: var(--bg-sunken);
}

.modal__body {
  padding: 20px;
  overflow: auto;
}

.modal__foot {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.28s var(--ease);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(24px) scale(0.96);
}
</style>