<script setup>
/**
 * 演示 10：异步组件 + Suspense + 模板引用
 * 覆盖：defineAsyncComponent、<Suspense> 的 default / fallback / @resolve / @pending、
 *       模板引用 ref、useTemplateRef（Vue 3.5 新 API）、在 DOM 上直接操作
 */
import { computed, defineAsyncComponent, onMounted, ref, useTemplateRef } from 'vue'
import SkeletonCard from '@/components/common/SkeletonCard.vue'

// 方式一：直接传 loader
const AsyncChart = defineAsyncComponent(() => import('@/components/lab/ChartPanel.vue'))

// 方式二：传入配置对象，指定加载中 / 出错 / 超时的兜底组件
const AsyncChartWithOptions = defineAsyncComponent({
  loader: () => import('@/components/lab/ChartPanel.vue'),
  loadingComponent: SkeletonCard,
  errorComponent: {
    template: '<p class="small" style="color:var(--danger)">图表组件加载失败，请检查网络后重试。</p>',
  },
  delay: 150,
  timeout: 8000,
})

const mode = ref('simple') // simple | options
const show = ref(false)
const status = ref('未加载')

// 模板引用：普通写法
const inputEl = ref(null)
// Vue 3.5 新增的 useTemplateRef：更明确地声明「这是一个模板引用」
const boxEl = useTemplateRef('boxEl')

const charCount = ref(0)

onMounted(() => {
  // onMounted 之后 DOM 才存在，此时才能拿到真实元素
  inputEl.value?.focus({ preventScroll: true })
  inputEl.value?.setAttribute('placeholder', '挂载后由 JS 设置的 placeholder')
})

function countChars() {
  charCount.value = inputEl.value?.value.length || 0
}

function flashBox() {
  const el = boxEl.value
  if (!el) return
  el.style.transition = 'all .3s'
  el.style.background = 'var(--accent-soft)'
  el.style.transform = 'scale(1.02)'
  setTimeout(() => {
    el.style.background = ''
    el.style.transform = ''
  }, 600)
}

function scrollToInput() {
  inputEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const activeAsync = computed(() => (mode.value === 'simple' ? AsyncChart : AsyncChartWithOptions))
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① 模板引用：直接操作 DOM</h4>
      <div ref="boxEl" class="ref-box">
        <input ref="inputEl" class="input" @input="countChars" />
        <div class="row wrap">
          <button class="btn small" @click="flashBox">用 ref 改样式（闪烁一下）</button>
          <button class="btn small" @click="scrollToInput">滚动到输入框</button>
          <span class="tag">已输入 {{ charCount }} 个字符</span>
        </div>
      </div>
      <p class="small muted">
        <code>const inputEl = ref(null)</code> 配合模板上的 <code>ref="inputEl"</code>，
        在 <code>onMounted</code> 之后就能拿到真实 DOM 元素。Vue 3.5 还提供了
        <code>useTemplateRef('boxEl')</code> 这种更清晰的写法（本示例两种都用上了）。
      </p>
    </div>

    <div class="demo__block">
      <h4>② 异步组件 + Suspense</h4>
      <div class="row wrap">
        <select v-model="mode" class="select" style="width: auto">
          <option value="simple">defineAsyncComponent(() =&gt; import(...))</option>
          <option value="options">带 loading / error / timeout 的配置对象</option>
        </select>
        <button class="btn btn-primary" @click="show = !show">{{ show ? '卸载异步组件' : '加载异步组件' }}</button>
        <span class="tag">状态：{{ status }}</span>
      </div>

      <!-- Suspense 会等待内部异步组件的 setup 完成（含顶层 await） -->
      <Suspense v-if="show" @resolve="status = '加载完成'" @pending="status = '加载中…'">
        <template #default>
          <component :is="activeAsync" />
        </template>
        <template #fallback>
          <div class="loading">
            <SkeletonCard :count="2" />
            <p class="small muted center">Suspense fallback：异步组件加载中…</p>
          </div>
        </template>
      </Suspense>

      <p v-else class="small muted">点击按钮后才会去下载 ChartPanel.vue 对应的代码分包（可在 Network 面板确认）。</p>
    </div>
  </div>
</template>

<style scoped>
.ref-box {
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  display: grid;
  gap: 10px;
}

.loading {
  margin-top: 16px;
  padding: 16px;
  border-radius: var(--radius);
  border: 1px dashed var(--border);
}

.center {
  text-align: center;
}
</style>