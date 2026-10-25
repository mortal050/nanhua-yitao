<script setup>
/**
 * App.vue —— 根组件
 * 结构：AppHeader（顶部导航） + <RouterView>（当前页面） + AppFooter（页脚）
 * 知识点：
 *   - RouterView 渲染匹配到的路由组件
 *   - <Transition> 内置组件给路由切换加过渡动画
 *   - 根组件里用 inject 读取插件提供的 notify（用于路由切换提示）
 */
import { inject, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const notify = inject('notify') // 来自 notify 插件（见 src/plugins/notify.js）
const ready = ref(false)

// provide / inject：向所有后代组件提供「站点信息」，避免逐层传 props
provide('siteInfo', {
  name: '南华易淘',
  school: '南华大学',
  slogan: '让闲置在校园里流动起来',
  version: '1.0.0',
})

onMounted(() => {
  ready.value = true
  // 首次访问且未登录时，展示一个欢迎提示（演示 window 事件 + 延迟）
  if (!localStorage.getItem('ny-welcomed')) {
    setTimeout(() => {
      notify('欢迎来到南华易淘，按 Ctrl/⌘ + K 可以快速搜索 👋', 'info', 3200)
      localStorage.setItem('ny-welcomed', '1')
    }, 800)
  }
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <!-- 路由出口：被缓存的组件由 <KeepAlive> 保留状态（见 router 配置与 LabView） -->
    <main class="app-main">
      <RouterView v-slot="{ Component, route: current }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="current.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />
    <BackToTop />
    <!-- 插件里全局注册的组件：渲染全局轻提示 -->
    <ToastHost />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}

/* 路由过渡动画：Vue 内置 <Transition> 提供的 6 个类名 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>