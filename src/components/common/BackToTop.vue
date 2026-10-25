<script setup>
/**
 * 回到顶部按钮
 * 知识点：组合式函数 useScrollBottom、<Transition> 条件过渡、window.scrollTo
 */
import { useScrollBottom } from '@/composables'

const { reachedBottom } = useScrollBottom(600)

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition name="pop">
    <button v-show="reachedBottom" class="back-top" title="回到顶部" @click="toTop">↑</button>
  </Transition>
</template>

<style scoped>
.back-top {
  position: fixed;
  right: 22px;
  bottom: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--brand-strong));
  box-shadow: var(--shadow);
  z-index: 60;
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.25s var(--ease);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(10px);
}
</style>