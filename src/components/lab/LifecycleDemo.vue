<script setup>
/**
 * 演示 6：生命周期钩子
 * 覆盖：onBeforeMount / onMounted / onBeforeUpdate / onUpdated / onBeforeUnmount / onUnmounted
 *       以及定时器清理、DOM 访问时机、卸载时的副作用清理
 *
 * 提示：本组件是否被销毁，由父组件（LabView）的「卸载 / 重新挂载」按钮控制 ——
 * 组件内部自己 v-if 是销毁不了自己的，这一点在课上很容易被问。
 */
import { inject, onBeforeMount, onBeforeUnmount, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue'

const notify = inject('notify', () => {})

const events = ref([])
const tick = ref(0)
const typed = ref('') // 绑定到输入框：每次输入都会触发组件更新
const boxRef = ref(null)
let timer = null

function log(name, extra = '') {
  events.value.unshift(`${new Date().toLocaleTimeString('zh-CN', { hour12: false })}  ${name} ${extra}`)
  if (events.value.length > 12) events.value.pop()
}

// 注意：onBeforeUpdate / onUpdated 里如果无条件修改被模板渲染的数据，
// 就会「更新 → 记日志 → 又更新」无限递归（Vue 会报 Maximum call stack size exceeded）。
// 所以这里用「值是否真的变了」做一层判断，只在数据变化时记一条日志。
let lastBeforeValue = null
let lastUpdatedValue = null

onBeforeMount(() => log('onBeforeMount', '— 组件即将挂载，此时拿不到 DOM'))
onMounted(() => {
  log('onMounted', `— 已挂载，可以访问 DOM：盒子高度 ${boxRef.value?.clientHeight}px`)
  timer = setInterval(() => (tick.value += 1), 1000)
})
onBeforeUpdate(() => {
  if (typed.value !== lastBeforeValue) {
    lastBeforeValue = typed.value
    log('onBeforeUpdate', '— 数据变了，DOM 还没更新')
  }
})
onUpdated(() => {
  // 控制台日志不会触发重新渲染，可以放心每次都打
  console.log('[LifecycleDemo] onUpdated', { tick: tick.value, typed: typed.value })
  if (typed.value !== lastUpdatedValue) {
    lastUpdatedValue = typed.value
    log('onUpdated', `— DOM 更新完成，输入框最新值「${typed.value}」`)
  }
})
onBeforeUnmount(() => {
  log('onBeforeUnmount', '— 组件即将卸载')
  notify('LifecycleDemo：onBeforeUnmount 触发', 'warn', 2600)
})
onUnmounted(() => {
  clearInterval(timer) // 关键：清理定时器，否则组件销毁后定时器仍在跑
  console.log('[LifecycleDemo] 已卸载，定时器已清理，避免内存泄漏')
  notify('LifecycleDemo：onUnmounted 已清理定时器 ✅', 'success', 3000)
})
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① 生命周期时间线</h4>
      <p class="small muted">
        组件存活时间：<strong>{{ tick }}</strong> 秒（onMounted 里启动的定时器每秒自增，同时触发 onUpdated）
      </p>

      <div ref="boxRef" class="box">
        <p>这个盒子高 {{ boxRef?.clientHeight }}px（onMounted 之后才拿得到真实尺寸）</p>
        <p class="small muted">在下面的输入框里打字，观察 onBeforeUpdate → onUpdated 的先后顺序</p>
        <input v-model="typed" class="input" placeholder="随便输入点什么…" />
        <p class="small muted">
          当前输入：<strong>{{ typed || '（空）' }}</strong> · 定时器 tick：{{ tick }}
        </p>
      </div>

      <ul class="log">
        <li v-for="(e, i) in events" :key="i">{{ e }}</li>
        <li v-if="!events.length" class="muted">暂无日志</li>
      </ul>

      <p class="small muted">
        👉 点击上方工具栏的「卸载演示组件」按钮，可以观察 onBeforeUnmount → onUnmounted 的执行顺序，
        以及定时器被清理后不再报错的效果（提示会以全局消息的形式出现，因为组件已经没了）。
      </p>
    </div>
  </div>
</template>

<style scoped>
.box {
  padding: 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  display: grid;
  gap: 8px;
  margin: 12px 0;
}

.log {
  display: grid;
  gap: 5px;
  font-size: 12.5px;
  max-height: 220px;
  overflow: auto;
  margin-bottom: 14px;
}

.log li {
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--bg-sunken);
  font-family: ui-monospace, Consolas, monospace;
}
</style>