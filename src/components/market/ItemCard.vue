<script setup>
/**
 * 商品卡片（列表/网格两种形态）
 * 知识点：
 *  - defineProps 校验、defineEmits 自定义事件
 *  - 动态 class 与动态 style 绑定
 *  - 自定义指令 v-highlight（关键词高亮）、v-ripple
 *  - 透传 attribute：卡片根节点直接接收父组件传下来的 class/title 等
 *  - 计算属性：折扣率、相对时间
 */
import { computed } from 'vue'
import { CATEGORY_MAP, coverGradient } from '@/data/categories'
import { useCurrency, useRelativeTime } from '@/composables'

const props = defineProps({
  item: { type: Object, required: true },
  /** 关键词，用于给标题做高亮 */
  keyword: { type: String, default: '' },
  /** grid：网格卡片；list：横向列表行 */
  mode: { type: String, default: 'grid', validator: (v) => ['grid', 'list'].includes(v) },
  favorite: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle-favorite', 'open'])

const money = useCurrency()
const fromNow = useRelativeTime()

const cover = computed(() => coverGradient(props.item.category, Number(props.item.id.slice(-2)) || 1))
const categoryIcon = computed(() => CATEGORY_MAP[props.item.category]?.icon || '🎁')
const categoryName = computed(() => CATEGORY_MAP[props.item.category]?.name || '其他')
const discount = computed(() => {
  const { price, originalPrice } = props.item
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round((1 - price / originalPrice) * 100)
})
</script>

<template>
  <article
    class="item-card"
    :class="[`item-card--${mode}`, { 'is-favorite': favorite }]"
    v-ripple="'rgba(15,157,118,0.28)'"
    @click="emit('open', item)"
  >
    <!-- 封面：没有图片资源，用分类渐变色 + emoji 生成，保证离线也不会白屏 -->
    <div class="item-card__cover" :style="{ background: cover }">
      <span class="item-card__emoji">{{ categoryIcon }}</span>
      <span v-if="discount" class="item-card__discount">省 {{ discount }}%</span>
      <span class="item-card__condition">{{ item.condition }}</span>
    </div>

    <div class="item-card__body">
      <h3 class="item-card__title" v-highlight="keyword">{{ item.title }}</h3>
      <p v-if="mode === 'list'" class="item-card__desc muted" v-highlight="keyword">
        {{ item.description }}
      </p>

      <div class="item-card__price">
        <strong>{{ money(item.price) }}</strong>
        <s v-if="item.originalPrice" class="muted">{{ money(item.originalPrice) }}</s>
        <span v-if="item.negotiable" class="tag tag-brand">可议价</span>
      </div>

      <div class="item-card__meta small muted">
        <span class="item-card__cat">{{ categoryName }}</span>
        <span>📍 {{ item.spot }}</span>
        <span>{{ fromNow(item.publishedAt) }}</span>
        <span class="spacer" />
        <span>👁 {{ item.views }}</span>
      </div>

      <div class="item-card__foot">
        <span class="item-card__seller">
          <em>{{ item.seller.name.slice(0, 1) }}</em>{{ item.seller.name }}
        </span>
        <button
          class="fav"
          :class="{ 'is-on': favorite }"
          :title="favorite ? '取消收藏' : '加入收藏'"
          @click.stop="emit('toggle-favorite', item)"
        >
          {{ favorite ? '❤️' : '🤍' }}
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.item-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease), border-color 0.2s;
}

.item-card--grid {
  flex-direction: column;
}

.item-card--list {
  flex-direction: row;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: color-mix(in srgb, var(--brand) 40%, var(--border));
}

.item-card__cover {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.item-card--grid .item-card__cover {
  height: 132px;
}

.item-card--list .item-card__cover {
  width: 160px;
  min-height: 140px;
}

.item-card__emoji {
  font-size: 40px;
  opacity: 0.55;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.item-card__discount {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: #d92b2b;
  font-size: 11.5px;
  font-weight: 700;
}

.item-card__condition {
  position: absolute;
  bottom: 8px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.34);
  color: #fff;
  font-size: 11px;
}

.item-card__body {
  padding: 13px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.item-card__title {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-card__desc {
  font-size: 12.5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.item-card__price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.item-card__price strong {
  font-size: 19px;
  color: var(--danger);
  font-weight: 800;
}

.item-card__price s {
  font-size: 12.5px;
}

.item-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  flex-wrap: wrap;
  row-gap: 4px;
}

.item-card__meta span {
  white-space: nowrap;
}

.item-card__cat {
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--bg-sunken);
  border: 1px solid var(--border);
  margin-right: 3px;
}

.item-card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.item-card__seller {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.item-card__seller em {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 11px;
  color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--accent));
}

.fav {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: transform 0.2s var(--ease);
}

.fav:hover {
  transform: scale(1.2);
}

.fav.is-on {
  animation: beat 0.4s var(--ease);
}

@keyframes beat {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.35);
  }
  100% {
    transform: scale(1);
  }
}

/* 全局注册的 v-highlight 指令生成的 mark 元素在子组件里，
   需要用 :deep() 才能让 scoped 样式生效（深度选择器知识点） */
:deep(mark.ny-hl) {
  background: linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--accent) 65%, transparent) 55%);
  color: inherit;
  padding: 0 1px;
  border-radius: 2px;
}
</style>