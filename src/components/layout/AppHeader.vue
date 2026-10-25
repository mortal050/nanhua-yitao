<script setup>
/**
 * 顶部导航栏
 * 知识点：
 *  - <RouterLink> 声明式导航、active class、exact-active-class
 *  - defineProps 定义 props 与默认值
 *  - 组合式函数 useWindowSize / useDebounceFn
 *  - 键盘事件监听 + onUnmounted 清理
 *  - v-model 双向绑定在自定义组件上的实现（见 SearchBox 子组件）
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import { useUserStore } from '@/stores/user'
import { useMarketStore } from '@/stores/market'
import { useDebounceFn, useWindowSize } from '@/composables'

const props = defineProps({
  /** 是否透明悬浮在页面顶部（首页用） */
  transparent: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const market = useMarketStore()
const { width } = useWindowSize()

const menuOpen = ref(false)
const quickKeyword = ref('')
const quickInput = ref(null) // 模板引用：拿到真实 DOM

const NAV = [
  { name: 'home', label: '首页', icon: '🏠' },
  { name: 'market', label: '二手市场', icon: '🛍️' },
  { name: 'publish', label: '发布闲置', icon: '📮' },
  { name: 'favorites', label: '我的收藏', icon: '❤️' },
  { name: 'lab', label: 'Vue 实验室', icon: '🧪' },
  { name: 'about', label: '关于', icon: 'ℹ️' },
]

const isMobile = computed(() => width.value < 900)
const navList = computed(() => NAV)
const favoritesCount = computed(() => market.favorites.length)

/** 执行快速搜索：把关键词写入 store 并跳转到市场页 */
function doQuickSearch() {
  const kw = quickKeyword.value.trim()
  if (!kw) return
  market.keyword = kw
  market.page = 1
  userStore.rememberSearch(kw)
  router.push({ name: 'market', query: { q: kw } })
  quickKeyword.value = ''
  menuOpen.value = false
}

/** 全局快捷键：Ctrl/⌘ + K 聚焦搜索框 */
const onKeydown = useDebounceFn((e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    quickInput.value?.focus()
  }
  if (e.key === 'Escape') menuOpen.value = false
}, 60)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// 路由变化时自动收起移动端菜单
watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="header" :class="{ 'header--transparent': props.transparent }">
    <div class="container header__inner">
      <!-- 站点 Logo：模板语法插值 + 动态 class 绑定 -->
      <RouterLink :to="{ name: 'home' }" class="logo" aria-label="回到首页">
        <span class="logo__mark">易</span>
        <span class="logo__text">
          <strong>南华易淘</strong>
          <em>校园二手交易平台</em>
        </span>
      </RouterLink>

      <!-- 桌面端导航 -->
      <nav v-if="!isMobile" class="nav">
        <RouterLink
          v-for="item in navList"
          :key="item.name"
          :to="{ name: item.name }"
          class="nav__link"
          active-class="nav__link--active"
        >
          <span class="nav__icon">{{ item.icon }}</span>{{ item.label }}
          <span v-if="item.name === 'favorites' && favoritesCount" class="nav__badge">
            {{ favoritesCount }}
          </span>
        </RouterLink>
      </nav>

      <!-- 快速搜索（桌面端） -->
      <div v-if="!isMobile" class="quick">
        <input
          ref="quickInput"
          v-model="quickKeyword"
          class="quick__input"
          type="search"
          placeholder="搜索闲置…"
          @keyup.enter="doQuickSearch"
        />
        <kbd class="quick__kbd">⌘K</kbd>
      </div>

      <div class="actions">
        <ThemeToggle />
        <button v-if="!userStore.isLogged" class="btn btn-primary btn-sm" @click="userStore.login()">
          一键登录
        </button>
        <div v-else class="user" :title="userStore.displayName">
          <span class="user__avatar">{{ userStore.avatar }}</span>
          <span class="user__name">{{ userStore.displayName }}</span>
        </div>
        <button
          v-if="isMobile"
          class="burger"
          :aria-expanded="menuOpen"
          aria-label="打开菜单"
          @click="menuOpen = !menuOpen"
        >
          {{ menuOpen ? '✕' : '☰' }}
        </button>
      </div>
    </div>

    <!-- 移动端抽屉：v-show 控制显隐（保留 DOM，切换开销小） -->
    <Transition name="drop">
      <div v-show="isMobile && menuOpen" class="drawer">
        <RouterLink
          v-for="item in navList"
          :key="item.name"
          :to="{ name: item.name }"
          class="drawer__link"
          active-class="drawer__link--active"
        >
          {{ item.icon }} {{ item.label }}
        </RouterLink>
        <div class="drawer__search row">
          <input v-model="quickKeyword" class="input" placeholder="搜索闲置…" @keyup.enter="doQuickSearch" />
          <button class="btn btn-primary" @click="doQuickSearch">搜索</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  height: var(--header-h);
  background: color-mix(in srgb, var(--bg-elevated) 88%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
}

.header--transparent {
  background: color-mix(in srgb, var(--bg-elevated) 70%, transparent);
}

.header__inner {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo__mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  box-shadow: var(--shadow-sm);
}

.logo__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.logo__text strong {
  font-size: 16px;
  letter-spacing: 0.5px;
}

.logo__text em {
  font-size: 11px;
  font-style: normal;
  color: var(--text-muted);
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s, background-color 0.2s;
}

.nav__link:hover {
  color: var(--text);
  background: var(--bg-sunken);
}

.nav__link--active {
  color: var(--brand-strong);
  background: var(--brand-soft);
}

.nav__icon {
  font-size: 13px;
}

.nav__badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  display: grid;
  place-items: center;
}

.quick {
  position: relative;
  display: flex;
  align-items: center;
}

.quick__input {
  width: 190px;
  padding: 8px 54px 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  outline: none;
  transition: width 0.25s var(--ease), border-color 0.2s;
}

.quick__input:focus {
  width: 250px;
  border-color: var(--brand);
  background: var(--bg-elevated);
}

.quick__kbd {
  position: absolute;
  right: 10px;
  font-size: 11px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1px 5px;
  background: var(--bg-elevated);
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.btn-sm {
  padding: 7px 14px;
  font-size: 13px;
}

.user {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px 5px 5px;
  border-radius: 999px;
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  font-size: 13px;
}

.user__avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--brand-soft);
  display: grid;
  place-items: center;
}

.burger {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  font-size: 16px;
}

.drawer {
  position: absolute;
  top: var(--header-h);
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  padding: 12px 16px 18px;
  display: grid;
  gap: 6px;
  box-shadow: var(--shadow);
}

.drawer__link {
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.drawer__link--active {
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.drawer__search {
  margin-top: 8px;
}

.drop-enter-active,
.drop-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>