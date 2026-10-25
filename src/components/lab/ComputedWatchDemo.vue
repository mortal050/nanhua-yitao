<script setup>
/**
 * 演示 2：计算属性与侦听器
 * 覆盖：computed 的 getter/setter、缓存特性、watch（deep / immediate）、watchEffect、停止侦听
 */
import { computed, ref, watch, watchEffect } from 'vue'
import { useMarketStore } from '@/stores/market'

const market = useMarketStore()

// ---- computed：带 getter 和 setter 的“可写计算属性” ----
const firstName = ref('星')
const lastName = ref('雨')
const fullName = computed({
  get: () => `${lastName.value}${firstName.value}`,
  set(val) {
    lastName.value = val.slice(0, 1)
    firstName.value = val.slice(1)
  },
})

// ---- computed 缓存：依赖不变时不会重新计算 ----
const price = ref(100)
const qty = ref(2)
const discountRatio = ref(0.1)
let calcTimes = 0
const total = computed(() => {
  calcTimes++
  return Math.round(price.value * qty.value * (1 - discountRatio.value) * 100) / 100
})
const other = ref(0) // 与 total 无关的响应式数据

// ---- watch：侦听单个/多个源，deep、immediate、flush ----
const watchedLog = ref([])
const form = ref({ title: '', tags: [] })
const stopHandle = ref(null)

watch(
  () => [market.keyword, market.category],
  ([kw, cat], [oldKw, oldCat]) => {
    watchedLog.value.unshift(`关键词 ${oldKw || '空'} → ${kw || '空'}；分类 ${oldCat} → ${cat}`)
    if (watchedLog.value.length > 5) watchedLog.value.pop()
  }
)

// 深度侦听对象
watch(
  form,
  (val) => {
    watchedLog.value.unshift(`表单变化：${val.title || '（空标题）'}`)
    if (watchedLog.value.length > 5) watchedLog.value.pop()
  },
  { deep: true }
)

// watchEffect：自动收集依赖，立即执行
const theme = ref(document.documentElement.dataset.theme || 'light')
watchEffect(() => {
  theme.value = document.documentElement.dataset.theme || 'light'
})

// 手动停止侦听
function startWatchCounter() {
  if (stopHandle.value) return
  const c = ref(0)
  const timer = setInterval(() => c.value++, 1000)
  stopHandle.value = watch(c, (v) => {
    watchedLog.value.unshift(`（临时侦听器）计数器 = ${v}`)
    if (watchedLog.value.length > 5) watchedLog.value.pop()
  })
  stopHandle.value.__timer = timer
}

function stopWatchCounter() {
  if (!stopHandle.value) return
  clearInterval(stopHandle.value.__timer)
  stopHandle.value() // 调用 watch 返回的函数即可停止侦听
  stopHandle.value = null
  watchedLog.value.unshift('已停止临时侦听器')
}

const saved = computed(() => Math.round((price.value * qty.value * discountRatio.value) * 100) / 100)
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① computed 的 getter / setter</h4>
      <div class="row wrap">
        <input v-model="firstName" class="input short" placeholder="名" />
        <input v-model="lastName" class="input short" placeholder="姓" />
        <span class="muted">→</span>
        <strong>{{ fullName }}</strong>
      </div>
      <label class="field" style="margin-top: 12px">
        <span class="field-label small">直接改写 fullName（会触发 setter）</span>
        <input v-model="fullName" class="input" />
      </label>
    </div>

    <div class="demo__block">
      <h4>② 计算属性缓存</h4>
      <div class="grid-2">
        <label class="field" style="margin: 0">
          <span class="field-label small">单价：{{ price }}</span>
          <input v-model.number="price" type="range" min="10" max="500" class="range" />
        </label>
        <label class="field" style="margin: 0">
          <span class="field-label small">数量：{{ qty }}</span>
          <input v-model.number="qty" type="range" min="1" max="10" class="range" />
        </label>
      </div>
      <p>
        合计：<strong>{{ total }}</strong> 元（已优惠 {{ saved }} 元）·
        computed 实际求值次数：<strong>{{ calcTimes }}</strong>
      </p>
      <div class="row wrap">
        <button class="btn small" @click="other++">修改无关数据（other = {{ other }}）</button>
        <span class="small muted">
          注意：求值次数不会因为这个按钮增加 —— computed 只有依赖变化时才重新计算。
        </span>
      </div>
    </div>

    <div class="demo__block">
      <h4>③ watch 侦听器</h4>
      <label class="field">
        <span class="field-label small">修改表单（deep 侦听）</span>
        <input v-model="form.title" class="input" placeholder="输入内容观察日志" />
      </label>
      <div class="row wrap">
        <button class="btn small" @click="form.tags.push('新标签' + (form.tags.length + 1))">
          往 tags 数组里 push
        </button>
        <button class="btn small" @click="startWatchCounter">启动临时侦听器</button>
        <button class="btn small" @click="stopWatchCounter">停止侦听</button>
        <span class="tag">当前主题（watchEffect）：{{ theme }}</span>
      </div>
      <ul class="log">
        <li v-for="(l, i) in watchedLog" :key="i">{{ l }}</li>
        <li v-if="!watchedLog.length" class="muted">还没有变化，试着修改上面的输入框或顶部搜索关键词</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.short {
  max-width: 110px;
}

.range {
  width: 100%;
  accent-color: var(--brand);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.log {
  margin-top: 12px;
  background: var(--bg-sunken);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 12.5px;
  display: grid;
  gap: 6px;
  max-height: 160px;
  overflow: auto;
}

.log li {
  border-left: 2px solid var(--brand);
  padding-left: 9px;
}

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>