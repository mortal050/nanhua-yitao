<script setup>
/**
 * 商品详情页
 * 知识点：
 *  - 动态路由参数：通过 props: true 把 :id 作为 props 传给组件（也可用 useRoute().params）
 *  - 生命周期：onMounted 里累加浏览量；watch 监听 id 变化（同一路由不同参数复用组件实例！）
 *  - 计算属性：折扣、省多少钱、相似推荐
 *  - 组件通信：子组件 emit 事件（CommentForm → 提交评价；BaseModal 确认下单）
 *  - 自定义指令 v-ripple
 *  - 未找到商品时渲染 404 提示（v-if / v-else）
 */
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORY_MAP, coverGradient } from '@/data/categories'
import { useMarketStore } from '@/stores/market'
import { useCurrency, useRelativeTime } from '@/composables'
import FavoriteButton from '@/components/market/FavoriteButton.vue'
import CommentList from '@/components/market/CommentList.vue'
import CommentForm from '@/components/market/CommentForm.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ItemGrid from '@/components/market/ItemGrid.vue'

const props = defineProps({
  /** 来自路由配置 props: true */
  id: { type: String, required: true },
})

const market = useMarketStore()
const router = useRouter()
const notify = inject('notify')
const money = useCurrency()
const fromNow = useRelativeTime()

const item = computed(() => market.findItem(props.id))
const category = computed(() => CATEGORY_MAP[item.value?.category] || { name: '其他', icon: '🎁', color: '#64748b' })
const cover = computed(() => (item.value ? coverGradient(item.value.category, 3) : 'none'))
const saved = computed(() => (item.value ? item.value.originalPrice - item.value.price : 0))
const discount = computed(() =>
  item.value?.originalPrice ? Math.round((1 - item.value.price / item.value.originalPrice) * 100) : 0
)
const comments = computed(() => (item.value ? market.commentsOf(item.value.id) : []))

/** 相似推荐：同分类的其他商品 */
const related = computed(() =>
  item.value
    ? market.items.filter((i) => i.category === item.value.category && i.id !== item.value.id).slice(0, 4)
    : []
)

const showOrder = ref(false)
const commentFormRef = ref(null)

onMounted(() => {
  if (item.value) market.incrementViews(props.id)
})

/**
 * 同一个路由（/item/:id）之间跳转时，组件实例会被复用，
 * 不会重新执行 onMounted，所以要靠 watch 监听参数变化。
 */
watch(
  () => props.id,
  (newId) => {
    market.incrementViews(newId)
    showOrder.value = false
  }
)

function submitComment(payload) {
  market.addComment(props.id, payload)
  notify('评价发表成功，感谢你的分享！', 'success')
}

function order() {
  showOrder.value = true
}

function confirmOrder() {
  showOrder.value = false
  notify('已向卖家发送交易意向，请留意站内消息 📩', 'success', 3000)
}

function openItem(target) {
  router.push({ name: 'item-detail', params: { id: target.id } })
}
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <!-- 商品不存在：v-else 分支 -->
      <template v-if="!item">
        <div class="notfound card">
          <h2>😕 商品不存在或已下架</h2>
          <p class="muted">它可能已经被别的同学带走了，去市场看看其他闲置吧。</p>
          <RouterLink class="btn btn-primary" :to="{ name: 'market' }">返回市场</RouterLink>
        </div>
      </template>

      <template v-else>
        <!-- 面包屑 -->
        <nav class="crumb small muted">
          <RouterLink :to="{ name: 'home' }">首页</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'market' }">二手市场</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'market', query: { category: item.category } }">
            {{ category.name }}
          </RouterLink>
          <span>/</span>
          <span class="crumb__current">{{ item.title }}</span>
        </nav>

        <div class="detail">
          <!-- 左侧封面 -->
          <div class="detail__gallery">
            <div class="cover" :style="{ background: cover }">
              <span>{{ category.icon }}</span>
              <em v-if="discount" class="cover__badge">已省 {{ discount }}%</em>
            </div>
            <div class="thumbs">
              <div v-for="n in 3" :key="n" class="thumb" :style="{ background: cover, opacity: 1 - (n - 1) * 0.18 }">
                {{ category.icon }}
              </div>
              <div class="thumb thumb--more">+{{ item.views % 5 + 2 }}</div>
            </div>
          </div>

          <!-- 右侧信息 -->
          <div class="detail__info">
            <div class="row wrap">
              <span class="tag tag-brand">{{ category.icon }} {{ category.name }}</span>
              <span class="tag">{{ item.condition }}</span>
              <span v-if="item.negotiable" class="tag" style="border-color: var(--accent); color: var(--accent)">
                可小刀
              </span>
            </div>

            <h1 class="detail__title">{{ item.title }}</h1>

            <div class="price-box">
              <strong>{{ money(item.price) }}</strong>
              <s v-if="item.originalPrice" class="muted">原价 {{ money(item.originalPrice) }}</s>
              <span v-if="saved > 0" class="tag tag-brand">省 {{ money(saved) }}</span>
            </div>

            <p class="detail__desc">{{ item.description }}</p>

            <ul class="meta-list">
              <li><span class="muted">交易地点</span><strong>{{ item.spot }}</strong></li>
              <li><span class="muted">发布时间</span><strong>{{ fromNow(item.publishedAt) }}</strong></li>
              <li><span class="muted">浏览次数</span><strong>{{ item.views }} 次</strong></li>
              <li><span class="muted">标签</span>
                <span class="row wrap" style="gap: 6px">
                  <span v-for="t in item.tags" :key="t" class="tag">{{ t }}</span>
                </span>
              </li>
            </ul>

            <div class="seller card">
              <span class="seller__avatar">{{ item.seller.name.slice(0, 1) }}</span>
              <div class="seller__info">
                <strong>{{ item.seller.name }}</strong>
                <p class="small muted">{{ item.seller.college }} · 信用分 {{ item.seller.credit }}</p>
              </div>
              <span class="tag tag-brand">已实名</span>
            </div>

            <div class="actions">
              <!-- 自定义指令 v-ripple：点击时水波纹 -->
              <button class="btn btn-primary btn-lg" v-ripple="'rgba(255,255,255,0.5)'" @click="order">
                我想要，联系卖家
              </button>
              <FavoriteButton :item-id="item.id" variant="text" />
              <button class="btn" @click="notify('已复制分享链接（模拟）', 'info')">分享</button>
            </div>
          </div>
        </div>

        <!-- 评价区 -->
        <div class="detail-bottom">
          <div class="panel">
            <CommentList :comments="comments" :item-id="item.id" @like="notify('感谢反馈 👍', 'success', 1400)" @reply="commentFormRef?.focus()" />
          </div>
          <div class="detail-bottom__form">
            <CommentForm ref="commentFormRef" @submit="submitComment" />
            <div class="panel safety">
              <h4>🛡️ 安全交易须知</h4>
              <ol class="small muted">
                <li>建议在图书馆、食堂等公共场所交易</li>
                <li>电子产品当面开机验货，确认序列号</li>
                <li>不要提前转账，避免「先付款后发货」的骗局</li>
                <li>发现违规商品可点击右上角举报</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- 相似推荐 -->
        <section v-if="related.length" class="panel">
          <h3 class="section-title">相似闲置推荐</h3>
          <ItemGrid
            :items="related"
            :favorite-ids="market.favorites"
            @open="openItem"
            @toggle-favorite="market.toggleFavorite($event.id)"
          />
        </section>

        <!-- 下单确认弹窗：具名插槽的完整用法 -->
        <BaseModal v-model="showOrder" title="确认交易意向">
          <p>你希望以 <strong>{{ money(item.price) }}</strong> 的价格联系卖家：</p>
          <div class="order-item">
            <span class="order-item__icon">{{ category.icon }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p class="small muted">{{ item.spot }} · {{ item.seller.name }}</p>
            </div>
          </div>
          <p class="small muted">提示：本站为课程实验项目，不会真的发送消息。</p>

          <template #footer="{ close }">
            <button class="btn" @click="close">再想想</button>
            <button class="btn btn-primary" @click="confirmOrder">确认发送</button>
          </template>
        </BaseModal>
      </template>
    </div>
  </div>
</template>

<style scoped>
.crumb {
  display: flex;
  gap: 7px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.crumb__current {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail {
  display: grid;
  grid-template-columns: 1.05fr 1.2fr;
  gap: 24px;
}

.cover {
  height: 340px;
  border-radius: var(--radius-lg);
  display: grid;
  place-items: center;
  font-size: 92px;
  position: relative;
  box-shadow: var(--shadow);
}

.cover__badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.94);
  color: #d92b2b;
  font-style: normal;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 12px;
}

.thumb {
  height: 66px;
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  font-size: 22px;
  opacity: 0.9;
}

.thumb--more {
  background: var(--bg-sunken) !important;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
}

.detail__info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail__title {
  font-size: 24px;
  line-height: 1.35;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--radius);
  background: linear-gradient(120deg, var(--accent-soft), transparent);
  border: 1px solid var(--border);
}

.price-box strong {
  font-size: 30px;
  color: var(--danger);
  font-weight: 800;
}

.detail__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-muted);
}

.meta-list {
  display: grid;
  gap: 9px;
  font-size: 13.5px;
}

.meta-list li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-list li > .muted {
  width: 72px;
  flex-shrink: 0;
}

.seller {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
}

.seller__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, var(--brand), var(--accent));
}

.seller__info {
  flex: 1;
}

.seller__info p {
  margin: 2px 0 0;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.btn-lg {
  padding: 13px 26px;
  font-size: 15px;
}

.detail-bottom {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 18px;
  margin: 20px 0;
  align-items: start;
}

.detail-bottom__form {
  display: grid;
  gap: 14px;
}

.safety h4 {
  font-size: 14px;
  margin-bottom: 8px;
}

.safety li {
  margin-bottom: 6px;
  line-height: 1.6;
}

.notfound {
  text-align: center;
  padding: 60px 20px;
  display: grid;
  gap: 12px;
  justify-items: center;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
  margin: 12px 0;
}

.order-item__icon {
  font-size: 26px;
}

@media (max-width: 900px) {
  .detail,
  .detail-bottom {
    grid-template-columns: 1fr;
  }
  .cover {
    height: 240px;
    font-size: 68px;
  }
}
</style>