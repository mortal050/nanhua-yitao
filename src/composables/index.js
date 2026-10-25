/**
 * 组合式函数（Composable）—— 官方教程《组合式函数》
 * 约定：
 *   1. 文件名以 use 开头，导出函数也以 use 开头；
 *   2. 在 setup 顶层同步调用；
 *   3. 返回 ref / computed / 函数的对象，调用方按需解构。
 */
import { customRef, onUnmounted, ref, watch } from 'vue'

/**
 * 与 localStorage 双向同步的 ref
 * @param {string} key 存储键
 * @param {*} defaultValue 默认值
 */
export function useLocalStorage(key, defaultValue = null) {
  const raw = localStorage.getItem(key)
  let init = defaultValue
  if (raw !== null) {
    try {
      init = JSON.parse(raw)
    } catch {
      init = raw
    }
  }
  const state = ref(init)

  watch(
    state,
    (val) => {
      if (val === null || val === undefined) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(val))
    },
    { deep: true }
  )

  return state
}

/**
 * 防抖 ref —— 用 customRef 自定义响应式依赖的读写时机（进阶知识点）
 * 常用于搜索框：输入停止 300ms 后才真正触发筛选
 */
export function useDebouncedRef(value = '', delay = 300) {
  let timer = null
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    },
  }))
}

/** 简易防抖函数 */
export function useDebounceFn(fn, delay = 300) {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 节流函数（用于滚动监听） */
export function useThrottleFn(fn, gap = 200) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= gap) {
      last = now
      fn(...args)
    }
  }
}

/**
 * 相对时间格式化：把时间戳变成「3 分钟前 / 2 天前」
 * 返回的是函数，不是 ref —— 组合式函数不一定非要返回响应式数据。
 */
export function useRelativeTime() {
  const units = [
    { limit: 60, div: 1, suffix: '秒前' },
    { limit: 3600, div: 60, suffix: '分钟前' },
    { limit: 86400, div: 3600, suffix: '小时前' },
    { limit: 2592000, div: 86400, suffix: '天前' },
  ]
  return (timestamp) => {
    const diff = Math.max(1, Math.floor((Date.now() - timestamp) / 1000))
    for (const u of units) {
      if (diff < u.limit) return `${Math.floor(diff / u.div)}${u.suffix}`
    }
    const d = new Date(timestamp)
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日`
  }
}

/** 价格格式化：1250 → ¥1,250 */
export function useCurrency() {
  return (value) => `¥${Number(value).toLocaleString('zh-CN')}`
}

/**
 * 滚动到底部检测 —— 演示 onUnmounted 清理副作用（防止内存泄漏）
 */
export function useScrollBottom(offset = 200) {
  const reachedBottom = ref(false)
  const onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    reachedBottom.value = scrollTop + clientHeight >= scrollHeight - offset
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
  return { reachedBottom }
}

/** 窗口尺寸响应式（演示 resize 监听 + 清理） */
export function useWindowSize() {
  const width = ref(window.innerWidth)
  const height = ref(window.innerHeight)
  const onResize = () => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }
  window.addEventListener('resize', onResize)
  onUnmounted(() => window.removeEventListener('resize', onResize))
  return { width, height, isMobile: () => width.value < 720 }
}