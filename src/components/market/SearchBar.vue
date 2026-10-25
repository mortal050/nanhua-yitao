<script setup>
/**
 * 搜索栏
 * 知识点：
 *  - 组件上的 v-model（defineModel）：父组件写 v-model="market.keyword"
 *  - 防抖：useDebouncedRef 用 customRef 自定义响应式读写时机
 *  - watch 侦听防抖后的值 → 触发真正的搜索
 *  - 键盘修饰符 @keyup.enter、表单修饰符 .trim
 *  - 历史搜索记录（来自 Pinia userStore）
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useMarketStore } from '@/stores/market'
import { useUserStore } from '@/stores/user'
import { useDebouncedRef, useThrottleFn } from '@/composables'

const emit = defineEmits(['search'])

const market = useMarketStore()
const userStore = useUserStore()

// 与父级/Store 双向绑定
const keyword = defineModel({ type: String, default: '' })

const inputRef = ref(null) // 模板引用
const local = ref(keyword.value)
const debounced = useDebouncedRef('', 320)
const hotWords = ['考研', '自行车', 'iPad', '台灯', '教材', '耳机']

onMounted(() => {
  local.value = market.keyword
  // 演示：页面加载后自动聚焦搜索框（只在桌面端做，避免移动端弹键盘）
  if (window.innerWidth > 900) inputRef.value?.focus({ preventScroll: true })
})

// 输入 → 写入防抖 ref
watch(local, (v) => {
  debounced.value = v
})

// 防抖值稳定后 → 真正更新 store 并通知父组件
watch(debounced, (v) => {
  keyword.value = v
  market.keyword = v
  if (v.trim()) userStore.rememberSearch(v)
  emit('search', v)
})

function searchNow() {
  keyword.value = local.value
  market.keyword = local.value
  if (local.value.trim()) userStore.rememberSearch(local.value)
  emit('search', local.value)
}

function pick(word) {
  local.value = word
  searchNow()
}

function clear() {
  local.value = ''
  keyword.value = ''
  market.keyword = ''
  emit('search', '')
  inputRef.value?.focus()
}

// 滚动时给搜索栏加阴影（节流函数示例）
const scrolled = ref(false)
const onScroll = useThrottleFn(() => (scrolled.value = window.scrollY > 40), 120)
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

/**
 * defineExpose：把内部方法暴露给父组件。
 * 父组件通过 ref 拿到该组件的实例后即可调用（见 MarketView 的 clearAll）。
 * <script setup> 中的变量默认是「封闭」的，不 expose 出去父组件访问不到。
 */
defineExpose({
  clear,
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <div class="searchbar card" :class="{ 'is-scrolled': scrolled }">
    <div class="searchbar__row">
      <span class="searchbar__icon">🔍</span>
      <input
        ref="inputRef"
        v-model.trim="local"
        class="searchbar__input"
        type="search"
        placeholder="搜索教材、数码、代步工具…（输入后自动搜索）"
        @keyup.enter="searchNow"
        @keyup.esc="clear"
      />
      <button v-if="local" class="searchbar__clear" title="清空" @click="clear">✕</button>
      <button class="btn btn-primary" @click="searchNow">搜索</button>
    </div>

    <div class="searchbar__hot row wrap">
      <span class="small muted">热门搜索：</span>
      <button v-for="w in hotWords" :key="w" class="chip" @click="pick(w)">{{ w }}</button>
      <template v-if="userStore.recentSearches.length">
        <span class="small muted searchbar__divider">|</span>
        <span class="small muted">历史：</span>
        <button v-for="w in userStore.recentSearches" :key="w" class="chip chip--ghost" @click="pick(w)">
          {{ w }}
        </button>
        <button class="chip chip--danger" @click="userStore.clearSearches()">清空历史</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.searchbar {
  padding: 14px 16px;
  transition: box-shadow 0.25s var(--ease);
}

.searchbar.is-scrolled {
  box-shadow: var(--shadow);
}

.searchbar__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.searchbar__icon {
  font-size: 16px;
}

.searchbar__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  padding: 8px 2px;
  min-width: 0;
}

.searchbar__clear {
  border: none;
  background: var(--bg-sunken);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-muted);
}

.searchbar__hot {
  margin-top: 10px;
  gap: 8px;
}

.searchbar__divider {
  margin: 0 4px;
}

.chip {
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.2s var(--ease);
}

.chip:hover {
  border-color: var(--brand);
  color: var(--brand-strong);
  background: var(--brand-soft);
}

.chip--ghost {
  background: transparent;
}

.chip--danger:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: transparent;
}
</style>