/**
 * 用户 / 界面偏好 Store
 * 演示知识点：watch 侦听器 + 副作用（同步 <html data-theme>）、actions、getters
 */
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const USER_KEY = 'ny-user'
const THEME_KEY = 'ny-theme'

export const useUserStore = defineStore('user', () => {
  // 模拟登录：真实项目里这里应该是 token + 后端接口
  const user = ref(loadUser())
  const theme = ref(localStorage.getItem(THEME_KEY) || 'light')
  const recentSearches = ref(JSON.parse(localStorage.getItem('ny-searches') || '[]'))

  const isLogged = computed(() => !!user.value)
  const displayName = computed(() => user.value?.name || '未登录')
  const avatar = computed(() => user.value?.avatar || '🙂')

  function login(name = '吴星雨') {
    user.value = { name, avatar: '🎓', college: '计算机学院', credit: 100, joinedAt: Date.now() }
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    return user.value
  }

  function logout() {
    user.value = null
    localStorage.removeItem(USER_KEY)
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function rememberSearch(kw) {
    const word = kw.trim()
    if (!word) return
    recentSearches.value = [word, ...recentSearches.value.filter((w) => w !== word)].slice(0, 6)
  }

  function clearSearches() {
    recentSearches.value = []
  }

  // 侦听主题变化 → 同步到 DOM 与 localStorage
  watch(
    theme,
    (val) => {
      document.documentElement.dataset.theme = val
      localStorage.setItem(THEME_KEY, val)
      // 给 body 加一个过渡类，让主题切换有平滑动画，300ms 后移除
      document.body.classList.add('theme-transition')
      setTimeout(() => document.body.classList.remove('theme-transition'), 360)
    },
    { immediate: true }
  )

  watch(recentSearches, (v) => localStorage.setItem('ny-searches', JSON.stringify(v)), { deep: true })

  return {
    user, theme, recentSearches,
    isLogged, displayName, avatar,
    login, logout, toggleTheme, rememberSearch, clearSearches,
  }
})

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}