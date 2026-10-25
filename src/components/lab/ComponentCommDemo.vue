<script setup>
/**
 * 演示 7：组件基础与组件通信
 * 覆盖：props 传值 / 校验、emits 自定义事件、组件上的 v-model、$attrs 透传、
 *       模板引用调用子组件方法（defineExpose）、动态组件 <component :is> + <KeepAlive>
 */
import { computed, ref, shallowRef } from 'vue'
import CounterPanel from '@/components/lab/CounterPanel.vue'
import StarRating from '@/components/common/StarRating.vue'

const count = ref(0)
const theme = ref('brand')
const panelRef = ref(null)
const events = ref([])
const rating = ref(4)

function onReachMax(max) {
  events.value.unshift(`子组件 emit('reach-max')：已经到上限 ${max} 了`)
}

function onCounterChange(payload) {
  events.value.unshift(`子组件 emit('change')：当前值 ${payload.value}，子组件内部点击 ${payload.innerClicks} 次`)
  if (events.value.length > 5) events.value.pop()
}

function callChildReset() {
  // 通过模板引用访问子组件通过 defineExpose 暴露的方法
  panelRef.value?.reset()
  events.value.unshift('父组件通过 ref 调用了子组件的 reset()')
}

// ---- 动态组件：用 shallowRef 保存组件对象（组件对象不需要深度响应式） ----
const TABS = [
  { key: 'counter', label: '计数面板', comp: CounterPanel },
  { key: 'rating', label: '星级评分', comp: StarRating },
]
const activeTab = shallowRef(TABS[0].comp)
const activeKey = ref('counter')

/** 不同组件需要的 props 不一样，用 computed 统一算出来再 v-bind 上去 */
const activeProps = computed(() =>
  activeKey.value === 'counter'
    ? {
        title: 'KeepAlive 演示',
        count: count.value,
        'onUpdate:count': (v) => (count.value = v),
        theme: 'accent',
        step: 1,
      }
    : {
        modelValue: rating.value,
        'onUpdate:modelValue': (v) => (rating.value = v),
        size: '24px',
        showText: true,
      }
)

function switchTab(tab) {
  activeKey.value = tab.key
  activeTab.value = tab.comp
}
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① props 传值 + emits 事件 + 组件 v-model</h4>
      <CounterPanel
        ref="panelRef"
        v-model:count="count"
        title="我想要的人数"
        theme="brand"
        :step="5"
        :max="30"
        class="custom-class-from-parent"
        data-from="parent"
        @reach-max="onReachMax"
        @change="onCounterChange"
      />

      <p class="small muted" style="margin-top: 10px">
        父组件的 <code>count</code> = <strong>{{ count }}</strong>；
        子组件用 <code>v-model:count</code> 双向绑定，不需要手写 props + emit 组合。
      </p>

      <div class="row wrap">
        <button class="btn small" @click="callChildReset">父组件调用子组件 reset()（模板引用 + defineExpose）</button>
        <span class="small muted">
          父组件还通过 $attrs 传了 class / data-from，子组件用 v-bind="$attrs" 决定它们挂在哪个元素上。
        </span>
      </div>

      <ul class="log">
        <li v-for="(e, i) in events" :key="i">{{ e }}</li>
        <li v-if="!events.length" class="muted">子组件的事件会显示在这里</li>
      </ul>
    </div>

    <div class="demo__block">
      <h4>② 动态组件 + KeepAlive</h4>
      <div class="tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="tabs__btn"
          :class="{ 'is-on': activeKey === t.key }"
          @click="switchTab(t)"
        >
          {{ t.label }}
        </button>
      </div>

      <div class="stage">
        <!-- <component :is> 会根据绑定的组件对象动态渲染不同组件 -->
        <KeepAlive>
          <component :is="activeTab" v-bind="activeProps" />
        </KeepAlive>
      </div>
      <p class="small muted">
        <strong>KeepAlive</strong> 会缓存被切走的组件实例：在「计数面板」里点几下，切到「星级评分」再切回来，
        内部点击次数不会被重置。去掉 KeepAlive 就会被重新创建。
      </p>
    </div>
  </div>
</template>

<style scoped>
.custom-class-from-parent {
  border-style: dashed;
}

.log {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  font-size: 12.5px;
  display: grid;
  gap: 6px;
  max-height: 150px;
  overflow: auto;
}

.tabs {
  display: flex;
  gap: 6px;
  background: var(--bg-sunken);
  padding: 4px;
  border-radius: 999px;
  width: fit-content;
  margin-bottom: 14px;
}

.tabs__btn {
  border: none;
  background: transparent;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 600;
}

.tabs__btn.is-on {
  background: var(--bg-elevated);
  color: var(--brand-strong);
  box-shadow: var(--shadow-sm);
}

.stage {
  padding: 16px;
  border-radius: var(--radius);
  border: 1px dashed var(--border);
  background: var(--bg-sunken);
  display: grid;
  place-items: center;
}
</style>