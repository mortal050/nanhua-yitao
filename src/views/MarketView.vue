<script setup>
/**
 * 二手市场页
 * 知识点：
 *  - 多个组件通过 Pinia store 共享状态（SearchBar / CategoryFilter / SortBar / ItemGrid 全部读写同一个 store）
 *  - 路由查询参数与筛选条件双向同步（useRoute + router.replace + watch，immediate 立即执行）
 *  - 模拟加载状态：骨架屏 SkeletonCard
 *  - v-show / v-if 组合、空状态 EmptyState
 *  - 模板引用 + defineExpose（调用子组件方法）
 */
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchBar from '@/components/market/SearchBar.vue'
import CategoryFilter from '@/components/market/CategoryFilter.vue'
import SortBar from '@/components/market/SortBar.vue'
import ItemGrid from '@/components/market/ItemGrid.vue'
import PaginationBar from '@/components/market/PaginationBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { useMarketStore } from '@/stores/market'

const market = useMarketStore()
const route = useRoute()
const router = useRouter()
const notify = inject('notify')

const loading = ref(false)
const searchBarRef = ref(null)
const showFilterPanel = ref(false) // 移动端筛选抽屉

/** 搜索关键词 v-model 绑定到 store */
const keyword = computed({
  get: () => market.keyword,
  set: (v) => (market.keyword = v),
})

/** 路由 query ↔ store 筛选条件同步 */
function applyQueryToStore() {
  const { q, category, sort, price, view } = route.query
  if (typeof q === 'string') market.keyword = q
  if (typeof category === 'string') market.category = category
  if (typeof sort === 'string') market.sortBy = sort
  if (typeof price === 'string') market.priceRange = price
  if (typeof view === 'string') market.viewMode = view
}

function syncStoreToQuery() {
  const query = {}
  if (market.keyword) query.q = market.keyword
  if (market.category !== 'all') query.category = market.category
  if (market.sortBy !== 'newest') query.sort = market.sortBy
  if (market.priceRange !== 'all') query.price = market.priceRange
  if (market.viewMode !== 'grid') query.view = market.viewMode
  // replace 不产生新的历史记录，避免浏览器后退键被筛选操作刷屏
  router.replace({ name: 'market', query })
}

// immediate: true → 组件初始化时就执行一次，保证从首页带 query 跳转过来能生效
watch(() => route.query, applyQueryToStore, { immediate: true, deep: true })

// store 变化 → 写回地址栏
watch(
  () => [market.keyword, market.category, market.sortBy, market.priceRange, market.viewMode],
  syncStoreToQuery
)

/** 模拟一次「网络请求」：切换分类/搜索时展示骨架屏 */
function fakeLoading() {
  loading.value = true
  setTimeout(() => (loading.value = false), 380)
}

onMounted(() => {
  // 首屏也走一次加载动画，让骨架屏可见
  fakeLoading()
})

watch(() => [market.category, market.keyword], fakeLoading)

function openItem(item) {
  router.push({ name: 'item-detail', params: { id: item.id } })
}

/** 在列表里直接收藏：调用 store 的 action，并给出全局提示 */
function toggleFav(item) {
  const added = market.toggleFavorite(item.id)
  notify(added ? `已收藏《${item.title}》` : '已取消收藏', added ? 'success' : 'info', 1700)
}

function clearAll() {
  market.resetFilters()
  searchBarRef.value?.clear?.() // 通过模板引用调用子组件 defineExpose 出来的方法
  router.replace({ name: 'market' })
}

const hasFilter = computed(
  () =>
    !!market.keyword ||
    market.category !== 'all' ||
    market.priceRange !== 'all' ||
    market.onlyNegotiable
)
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <!-- 面包屑：用 v-for 渲染层级 -->
      <nav class="crumb small muted">
        <RouterLink :to="{ name: 'home' }">首页</RouterLink>
        <span>/</span>
        <span>二手市场</span>
        <span v-if="market.category !== 'all'">/ {{ market.category }}</span>
      </nav>

      <header class="market-head row-between wrap">
        <div>
          <h1>二手市场</h1>
          <p class="muted small">
            共 {{ market.filteredItems.length }} 件商品
            <template v-if="market.keyword">
              ，关键词「<strong>{{ market.keyword }}</strong>」
            </template>
          </p>
        </div>
        <div class="row">
          <button class="btn btn-ghost" @click="showFilterPanel = !showFilterPanel">
            🎛️ 筛选
          </button>
          <button v-if="hasFilter" class="btn" @click="clearAll">清空条件</button>
        </div>
      </header>

      <SearchBar ref="searchBarRef" v-model="keyword" @search="() => (market.page = 1)" />

      <div class="market-body">
        <!-- 侧边栏：桌面端常驻，移动端用 v-show 控制 -->
        <aside class="market-side" :class="{ 'is-open': showFilterPanel }">
          <div class="panel">
            <h3 class="side-title">商品分类</h3>
            <CategoryFilter layout="sidebar" />
          </div>
          <div class="panel side-tip">
            <h4>🎓 交易提示</h4>
            <ul class="small muted">
              <li>优先选择校内公共场所面交</li>
              <li>大额商品建议当面验货</li>
              <li>保留聊天记录作为凭证</li>
            </ul>
          </div>
        </aside>

        <section class="market-main">
          <SortBar
            v-model:sort="market.sortBy"
            v-model:view="market.viewMode"
            v-model:range="market.priceRange"
            v-model:negotiable="market.onlyNegotiable"
            :result-count="market.filteredItems.length"
          />

          <SkeletonCard v-if="loading" :count="market.pageSize" class="skeleton-block" />

          <template v-else>
            <ItemGrid
              v-if="market.pagedItems.length"
              :items="market.pagedItems"
              :mode="market.viewMode"
              :keyword="market.keyword"
              :favorite-ids="market.favorites"
              @open="openItem"
              @toggle-favorite="toggleFav"
            >
              <!-- 作用域插槽：自定义底部统计 -->
              <template #summary="{ count, mode }">
                <p class="small muted center" style="margin-top: 14px">
                  本页显示 {{ count }} 件 · 当前为{{ mode === 'grid' ? '网格' : '列表' }}视图
                </p>
              </template>
            </ItemGrid>

            <EmptyState
              v-else
              icon="🔍"
              title="没有找到符合条件的闲置"
              desc="试着减少筛选条件，或者换个关键词看看"
            >
              <button class="btn btn-primary" @click="clearAll">清空筛选条件</button>
            </EmptyState>
          </template>

          <!-- 分页：v-model 直接绑定 store 中的当前页 -->
          <PaginationBar v-model="market.page" :total="market.totalPages" />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crumb {
  display: flex;
  gap: 7px;
  margin-bottom: 12px;
}

.market-head {
  margin-bottom: 14px;
}

.market-head h1 {
  font-size: 22px;
}

.market-head p {
  margin: 4px 0 0;
}

.market-body {
  display: grid;
  grid-template-columns: 232px 1fr;
  gap: 18px;
  margin-top: 16px;
  align-items: start;
}

.market-side {
  display: grid;
  gap: 14px;
  position: sticky;
  top: 82px;
}

.side-title {
  font-size: 14px;
  margin-bottom: 12px;
}

.side-tip h4 {
  font-size: 13.5px;
  margin-bottom: 8px;
}

.side-tip li {
  margin-bottom: 5px;
  position: relative;
  padding-left: 12px;
}

.side-tip li::before {
  content: '·';
  position: absolute;
  left: 2px;
  color: var(--brand);
  font-weight: 800;
}

.market-main {
  min-width: 0;
}

.skeleton-block {
  margin-top: 18px;
}

@media (max-width: 900px) {
  .market-body {
    grid-template-columns: 1fr;
  }

  .market-side {
    position: static;
    display: none;
  }

  .market-side.is-open {
    display: grid;
  }
}
</style>