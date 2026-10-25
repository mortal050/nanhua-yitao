/**
 * Pinia 状态管理 —— 官方教程《状态管理》
 * 采用「Setup Store」写法（组合式函数风格），和 <script setup> 完全一致：
 *   ref()  → state
 *   computed() → getters
 *   function → actions
 * 组件中通过 useMarketStore() 获取同一个单例 store。
 */
import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { seedComments, seedItems } from '@/data/items'
import { CATEGORIES } from '@/data/categories'

const KEYS = {
  favorites: 'ny-favorites',
  published: 'ny-published',
  comments: 'ny-comments',
}

/** 读 localStorage（出错时回退默认值，避免脏数据导致白屏） */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const useMarketStore = defineStore('market', () => {
  // ---------------- state ----------------
  // 用户自己发布的商品排在种子数据前面
  const items = ref([...load(KEYS.published, []), ...seedItems])
  const favorites = ref(load(KEYS.favorites, []))
  const localComments = ref(load(KEYS.comments, {}))

  // 筛选条件
  const keyword = ref('')
  const category = ref('all')
  const priceRange = ref('all')
  const onlyNegotiable = ref(false)
  const sortBy = ref('newest')
  const page = ref(1)
  const pageSize = ref(8)
  const viewMode = ref('grid') // grid | list

  // ---------------- getters ----------------
  /** 分类计数（用于市场页左侧筛选器上的数字徽标） */
  const categoryCounts = computed(() => {
    const map = { all: items.value.length }
    for (const c of CATEGORIES) map[c.id] = 0
    for (const it of items.value) map[it.category] = (map[it.category] || 0) + 1
    return map
  })

  const PRICE_RANGES = {
    all: () => true,
    '0-50': (p) => p < 50,
    '50-200': (p) => p >= 50 && p < 200,
    '200-1000': (p) => p >= 200 && p < 1000,
    '1000+': (p) => p >= 1000,
  }

  /** 筛选 + 排序后的结果（多个条件串联，全部写在 computed 里自动缓存） */
  const filteredItems = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    const inRange = PRICE_RANGES[priceRange.value] || PRICE_RANGES.all
    const list = items.value.filter((it) => {
      const hitKeyword =
        !kw ||
        it.title.toLowerCase().includes(kw) ||
        it.description.toLowerCase().includes(kw) ||
        it.tags.some((t) => t.toLowerCase().includes(kw)) ||
        it.seller.name.toLowerCase().includes(kw)
      const hitCategory = category.value === 'all' || it.category === category.value
      const hitPrice = inRange(it.price)
      const hitNegotiable = !onlyNegotiable.value || it.negotiable
      return hitKeyword && hitCategory && hitPrice && hitNegotiable
    })

    const sorters = {
      newest: (a, b) => b.publishedAt - a.publishedAt,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      hot: (a, b) => b.views - a.views,
    }
    return [...list].sort(sorters[sortBy.value] || sorters.newest)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))

  /** 当前页数据 —— 分页在客户端完成 */
  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  const favoriteItems = computed(() => items.value.filter((it) => favorites.value.includes(it.id)))

  /** 首页推荐：浏览量最高的 4 件 */
  const hotItems = computed(() => [...items.value].sort((a, b) => b.views - a.views).slice(0, 4))

  /** 最新发布 8 件 */
  const latestItems = computed(() =>
    [...items.value].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 8)
  )

  /** 平台统计（首页数字看板） */
  const stats = computed(() => {
    const prices = items.value.map((i) => i.price)
    const total = items.value.length
    const avg = total ? Math.round(prices.reduce((s, p) => s + p, 0) / total) : 0
    const saved = items.value.reduce((s, i) => s + Math.max(0, i.originalPrice - i.price), 0)
    const deals = items.value.filter((i) => i.negotiable).length
    return { total, avg, saved, deals, sellers: 128, todayNew: 6 }
  })

  /** 每个分类的平均价（市场页图表条） */
  const priceByCategory = computed(() =>
    CATEGORIES.map((c) => {
      const list = items.value.filter((i) => i.category === c.id)
      const avg = list.length ? Math.round(list.reduce((s, i) => s + i.price, 0) / list.length) : 0
      return { ...c, count: list.length, avg }
    }).filter((c) => c.count > 0)
  )

  // ---------------- actions ----------------
  function isFavorite(id) {
    return favorites.value.includes(id)
  }

  function toggleFavorite(id) {
    const idx = favorites.value.indexOf(id)
    if (idx > -1) favorites.value.splice(idx, 1)
    else favorites.value.push(id)
    return idx === -1 // true 表示“已加入收藏”
  }

  function clearFavorites() {
    favorites.value = []
  }

  /** 用 id 取商品，找不到返回 undefined（详情页据此渲染 404 提示） */
  function findItem(id) {
    return items.value.find((it) => it.id === id)
  }

  function incrementViews(id) {
    const it = findItem(id)
    if (it) it.views += 1
  }

  const PAGE_SIZE_MAX = 999
  /** 发布新商品：unshift 到数组头部，靠响应式自动刷新列表 */
  function addItem(payload) {
    const item = {
      id: `ny-u-${Date.now().toString(36)}`,
      views: 0,
      likes: 0,
      negotiable: payload.negotiable ?? true,
      publishedAt: Date.now(),
      seller: { name: '我（吴星雨）', college: '计算机学院', credit: 100 },
      tags: payload.tags?.length ? payload.tags : ['新发布'],
      ...payload,
    }
    items.value.unshift(item)
    page.value = 1
    return item
  }

  function removeItem(id) {
    const idx = items.value.findIndex((it) => it.id === id)
    if (idx > -1) items.value.splice(idx, 1)
    favorites.value = favorites.value.filter((f) => f !== id)
  }

  /** 某件商品的评论：预置评论 + 本地新增评论 */
  function commentsOf(id) {
    const locals = localComments.value[id] || []
    const seeds = seedComments[id] || []
    return [...locals, ...seeds]
  }

  function addComment(id, comment) {
    const list = localComments.value[id] || []
    list.unshift({ ...comment, id: `c-${Date.now()}`, time: Date.now() })
    localComments.value[id] = list
  }

  const commentCount = (id) => commentsOf(id).length

  function resetFilters() {
    keyword.value = ''
    category.value = 'all'
    priceRange.value = 'all'
    onlyNegotiable.value = false
    sortBy.value = 'newest'
    page.value = 1
  }

  // ---------------- 持久化：watch 侦听变化写回 localStorage ----------------
  watch(favorites, (v) => localStorage.setItem(KEYS.favorites, JSON.stringify(v)), { deep: true })
  watch(
    items,
    (v) => localStorage.setItem(KEYS.published, JSON.stringify(v.filter((i) => i.id.startsWith('ny-u-')))),
    { deep: true }
  )
  watch(localComments, (v) => localStorage.setItem(KEYS.comments, JSON.stringify(v)), { deep: true })

  // 筛选条件变化时自动回到第 1 页
  watch([keyword, category, priceRange, onlyNegotiable, sortBy, pageSize], () => {
    page.value = 1
  })

  // 页码越界保护（例如筛选后当前页超出范围）
  watch(totalPages, (max) => {
    if (page.value > max) page.value = max
  })

  return {
    // state
    items, favorites, keyword, category, priceRange, onlyNegotiable, sortBy, page, pageSize, viewMode,
    // getters
    categoryCounts, filteredItems, totalPages, pagedItems, favoriteItems, hotItems, latestItems, stats,
    priceByCategory, PRICE_RANGES, PAGE_SIZE_MAX,
    // actions
    isFavorite, toggleFavorite, clearFavorites, findItem, incrementViews, addItem, removeItem,
    commentsOf, addComment, commentCount, resetFilters,
  }
})