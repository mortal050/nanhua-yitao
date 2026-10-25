<script setup>
/**
 * 我的收藏
 * 知识点：
 *  - 从 Pinia getter 读取派生列表 favoriteItems
 *  - computed 统计：收藏总价值、平均折扣
 *  - watch 侦听收藏数量变化，数量归零时弹提示（副作用）
 *  - 条件渲染分支：空状态 / 列表
 *  - 二次确认对话框（BaseModal）
 *  - useLocalStorage 组合式函数演示：收藏备注（本地持久化）
 */
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarketStore } from '@/stores/market'
import { useCurrency, useLocalStorage } from '@/composables'
import ItemGrid from '@/components/market/ItemGrid.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const market = useMarketStore()
const router = useRouter()
const notify = inject('notify')
const money = useCurrency()

/** 用组合式函数把「收藏备注」持久化到 localStorage */
const notes = useLocalStorage('ny-fav-notes', {})

const showClearConfirm = ref(false)
const sortByPrice = ref(false)

const list = computed(() => {
  const arr = [...market.favoriteItems]
  return sortByPrice.value ? arr.sort((a, b) => a.price - b.price) : arr
})

const totalValue = computed(() => list.value.reduce((s, i) => s + i.price, 0))
const totalSaved = computed(() =>
  list.value.reduce((s, i) => s + Math.max(0, i.originalPrice - i.price), 0)
)

function openItem(item) {
  router.push({ name: 'item-detail', params: { id: item.id } })
}

function removeAll() {
  market.clearFavorites()
  showClearConfirm.value = false
  notify('已清空收藏夹', 'info')
}

function saveNote(item) {
  const text = window.prompt('给这件闲置写个备注：', notes.value[item.id] || '')
  if (text === null) return
  notes.value = { ...notes.value, [item.id]: text }
  notify('备注已保存到本地', 'success', 1500)
}

// 侦听收藏数量的变化：显示不同提示
watch(
  () => market.favorites.length,
  (n, old) => {
    if (n === 0 && old > 0) notify('收藏夹空空如也，去市场逛逛吧', 'warn')
  }
)
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <header class="fav-head row-between wrap">
        <div>
          <h1>我的收藏</h1>
          <p class="muted small">
            共 {{ list.length }} 件 · 合计 {{ money(totalValue) }} · 比原价省 {{ money(totalSaved) }}
          </p>
        </div>
        <div class="row wrap">
          <label class="check small">
            <input v-model="sortByPrice" type="checkbox" />
            按价格排序
          </label>
          <button class="btn" :disabled="!list.length" @click="showClearConfirm = true">清空收藏</button>
          <RouterLink class="btn btn-primary" :to="{ name: 'market' }">继续淘货</RouterLink>
        </div>
      </header>

      <!-- 空状态 -->
      <EmptyState
        v-if="!list.length"
        icon="💔"
        title="收藏夹还是空的"
        desc="在市场上点一下商品卡片右下角的 🤍 就能收藏，方便以后比较价格"
      />

      <template v-else>
        <ItemGrid
          :items="list"
          :favorite-ids="market.favorites"
          @open="openItem"
          @toggle-favorite="market.toggleFavorite($event.id)"
        />

        <!-- 收藏备注：演示 useLocalStorage 组合式函数 -->
        <section class="panel notes">
          <h3 class="section-title">收藏备注（本地保存）</h3>
          <ul class="notes__list">
            <li v-for="it in list" :key="it.id">
              <span class="notes__title">{{ it.title }}</span>
              <span class="notes__note small muted">{{ notes[it.id] || '还没有备注' }}</span>
              <button class="link" @click="saveNote(it)">{{ notes[it.id] ? '修改' : '添加' }}</button>
            </li>
          </ul>
        </section>
      </template>

      <BaseModal v-model="showClearConfirm" title="确认清空收藏？" width="420px">
        <p>清空后这些商品不会再出现在收藏夹中，操作不可撤销。</p>
        <template #footer>
          <button class="btn" @click="showClearConfirm = false">取消</button>
          <button class="btn btn-primary" @click="removeAll">确认清空</button>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<style scoped>
.fav-head {
  margin-bottom: 18px;
}

.fav-head h1 {
  font-size: 22px;
}

.fav-head p {
  margin: 4px 0 0;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-muted);
}

.check input {
  accent-color: var(--brand);
}

.notes {
  margin-top: 22px;
}

.notes__list {
  display: grid;
  gap: 10px;
}

.notes__list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  font-size: 13.5px;
}

.notes__title {
  font-weight: 600;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notes__note {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link {
  border: none;
  background: transparent;
  color: var(--brand-strong);
  cursor: pointer;
  font-size: 12.5px;
}
</style>