<script setup>
/**
 * 首页
 * 知识点：
 *  - 组合多个子组件（组件化开发）
 *  - 从 Pinia store 读取派生数据（stats / hotItems / latestItems）
 *  - 使用全局注册组件 <StatBadge>
 *  - 异步组件 defineAsyncComponent + <Suspense>（懒加载「最新发布」区域）
 *  - 用 computed 生成问候语（根据当前时间变化）
 */
import { computed, defineAsyncComponent, inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BannerCarousel from '@/components/home/BannerCarousel.vue'
import FeaturePanel from '@/components/home/FeaturePanel.vue'
import ItemGrid from '@/components/market/ItemGrid.vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import { useMarketStore } from '@/stores/market'
import { useUserStore } from '@/stores/user'
import { useCurrency } from '@/composables'

const market = useMarketStore()
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const notify = inject('notify')
const money = useCurrency()

/** 被路由守卫拦回来时（/publish 需要登录），在首页给出提示 */
onMounted(() => {
  if (route.query.needLogin) {
    notify('发布闲置需要先登录，点击右上角「一键登录」即可', 'warn', 3200)
  }
})

// 异步组件：单独打包，加载时显示 loadingComponent，失败显示 errorComponent
const LazyTimeline = defineAsyncComponent({
  loader: () => import('@/components/home/PlatformTimeline.vue'),
  loadingComponent: SkeletonCard,
  delay: 120,
  errorComponent: {
    template: '<p class="muted small">动态模块加载失败，请刷新重试。</p>',
  },
})

const showTimeline = ref(false)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，注意休息'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

function openItem(item) {
  router.push({ name: 'item-detail', params: { id: item.id } })
}

function toggleFav(item) {
  market.toggleFavorite(item.id)
}

/** 选择分类后跳转到市场页 */
function goCategory(id) {
  router.push({ name: 'market', query: { category: id } })
}
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <!-- 欢迎条 -->
      <div class="hello card">
        <div>
          <h1>{{ greeting }}，{{ userStore.displayName }} 👋</h1>
          <p class="muted">
            南华易淘已经收录了 <strong>{{ market.stats.total }}</strong> 件闲置，
            累计帮同学省下 <strong>{{ money(market.stats.saved) }}</strong>。
          </p>
        </div>
        <div class="row wrap">
          <RouterLink class="btn btn-primary" :to="{ name: 'market' }">开始淘货</RouterLink>
          <RouterLink class="btn" :to="{ name: 'publish' }">发布闲置</RouterLink>
        </div>
      </div>

      <!-- 轮播 -->
      <BannerCarousel />

      <!-- 数据看板：全局注册的 StatBadge 组件 -->
      <div class="stats">
        <StatBadge label="在售闲置" :value="market.stats.total" icon="📦" suffix="件" :trend="12" />
        <StatBadge label="平均成交价" :value="money(market.stats.avg)" icon="💰" color="var(--accent)" />
        <StatBadge label="可议价商品" :value="market.stats.deals" icon="🤝" color="#8b5cf6" :trend="-4" />
        <StatBadge label="今日新上架" :value="market.stats.todayNew" icon="🆕" color="#06b6d4" />
      </div>

      <!-- 分类快捷入口 -->
      <section class="panel">
        <h3 class="section-title">按分类逛</h3>
        <div class="cats-grid">
          <button
            v-for="c in market.priceByCategory"
            :key="c.id"
            class="cat-card"
            :style="{ '--c': c.color }"
            @click="goCategory(c.id)"
          >
            <span class="cat-card__icon">{{ c.icon }}</span>
            <span class="cat-card__name">{{ c.name }}</span>
            <span class="cat-card__meta small">{{ c.count }} 件 · 均价 {{ money(c.avg) }}</span>
          </button>
        </div>
      </section>

      <!-- 热门推荐 -->
      <section class="panel">
        <div class="row-between wrap" style="margin-bottom: 14px">
          <h3 class="section-title" style="margin: 0">🔥 大家都在看</h3>
          <RouterLink class="small muted" :to="{ name: 'market', query: { sort: 'hot' } }">
            查看全部 →
          </RouterLink>
        </div>
        <ItemGrid
          :items="market.hotItems"
          :favorite-ids="market.favorites"
          @open="openItem"
          @toggle-favorite="toggleFav"
        />
      </section>

      <!-- 最新发布 + 异步组件 -->
      <section class="panel">
        <div class="row-between wrap" style="margin-bottom: 14px">
          <h3 class="section-title" style="margin: 0">🆕 最新发布</h3>
          <button class="btn btn-ghost small" @click="showTimeline = !showTimeline">
            {{ showTimeline ? '收起平台动态' : '展开平台动态（异步组件）' }}
          </button>
        </div>
        <ItemGrid
          :items="market.latestItems.slice(0, 4)"
          :favorite-ids="market.favorites"
          @open="openItem"
          @toggle-favorite="toggleFav"
        />

        <!-- Suspense：等待异步组件加载完成期间显示 fallback -->
        <Suspense v-if="showTimeline">
          <template #default>
            <LazyTimeline />
          </template>
          <template #fallback>
            <SkeletonCard :count="2" />
          </template>
        </Suspense>
      </section>

      <FeaturePanel />
    </div>
  </div>
</template>

<style scoped>
.hello {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 24px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.hello h1 {
  font-size: 22px;
  margin-bottom: 6px;
}

.hello p {
  margin: 0;
  font-size: 13.5px;
}

.hello strong {
  color: var(--brand-strong);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin: 18px 0;
}

.panel {
  margin-bottom: 18px;
}

.cats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.cat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  text-align: left;
  transition: all 0.22s var(--ease);
}

.cat-card:hover {
  transform: translateY(-3px);
  border-color: var(--c);
  box-shadow: 0 8px 22px color-mix(in srgb, var(--c) 22%, transparent);
}

.cat-card__icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.cat-card__name {
  font-weight: 700;
  font-size: 14px;
}

.cat-card__meta {
  color: var(--text-muted);
}
</style>