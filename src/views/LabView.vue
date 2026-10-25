<script setup>
/**
 * Vue 知识实验室
 * 知识点：
 *  - 动态组件 <component :is> + <KeepAlive>（切换标签时保留各演示组件的状态）
 *  - 组件注册：这里集中 import 并组织成一个配置数组
 *  - shallowRef 保存组件对象（组件对象不需要深度响应式，避免性能浪费与警告）
 *  - v-for 渲染侧边目录 + 选中态
 *  - 卸载 / 重新挂载演示组件：观察子组件生命周期钩子
 */
import { computed, ref, shallowRef } from 'vue'
import ReactivityDemo from '@/components/lab/ReactivityDemo.vue'
import ComputedWatchDemo from '@/components/lab/ComputedWatchDemo.vue'
import ClassStyleDemo from '@/components/lab/ClassStyleDemo.vue'
import ListRenderDemo from '@/components/lab/ListRenderDemo.vue'
import EventFormDemo from '@/components/lab/EventFormDemo.vue'
import LifecycleDemo from '@/components/lab/LifecycleDemo.vue'
import ComponentCommDemo from '@/components/lab/ComponentCommDemo.vue'
import SlotDemo from '@/components/lab/SlotDemo.vue'
import ProvideDirectiveDemo from '@/components/lab/ProvideDirectiveDemo.vue'
import AsyncRefDemo from '@/components/lab/AsyncRefDemo.vue'

/** 演示清单：每一项对应官方教程的一个/多个章节 */
const DEMOS = [
  {
    key: 'reactivity',
    icon: '⚡',
    title: '响应式基础与模板语法',
    chapter: '响应式基础 / 模板语法',
    comp: ReactivityDemo,
  },
  {
    key: 'computed',
    icon: '🧮',
    title: '计算属性与侦听器',
    chapter: '计算属性 / 侦听器',
    comp: ComputedWatchDemo,
  },
  {
    key: 'class',
    icon: '🎨',
    title: '类与样式绑定 + 条件渲染',
    chapter: 'Class 与 Style 绑定 / 条件渲染',
    comp: ClassStyleDemo,
  },
  {
    key: 'list',
    icon: '📋',
    title: '列表渲染',
    chapter: '列表渲染',
    comp: ListRenderDemo,
  },
  {
    key: 'event',
    icon: '🖱️',
    title: '事件处理与表单绑定',
    chapter: '事件处理 / 表单输入绑定',
    comp: EventFormDemo,
  },
  {
    key: 'lifecycle',
    icon: '⏱️',
    title: '生命周期钩子',
    chapter: '生命周期钩子',
    comp: LifecycleDemo,
  },
  {
    key: 'component',
    icon: '🧩',
    title: '组件通信与动态组件',
    chapter: '组件基础 / Props / 事件 / 组件注册',
    comp: ComponentCommDemo,
  },
  {
    key: 'slot',
    icon: '🪟',
    title: '插槽（默认 / 具名 / 作用域）',
    chapter: '插槽',
    comp: SlotDemo,
  },
  {
    key: 'provide',
    icon: '💉',
    title: '依赖注入与自定义指令',
    chapter: '依赖注入 / 自定义指令 / 插件',
    comp: ProvideDirectiveDemo,
  },
  {
    key: 'async',
    icon: '🚀',
    title: '异步组件与模板引用',
    chapter: '异步组件 / 模板引用 / Suspense',
    comp: AsyncRefDemo,
  },
]

const activeKey = ref(DEMOS[0].key)
const mounted = ref(true)

// 用 shallowRef 保存组件对象：只有整体替换才需要响应式
const activeComp = shallowRef(DEMOS[0].comp)

// KeepAlive 的 include/exclude 演示：这里全部缓存
const cachedKeys = DEMOS.map((d) => d.key)

const activeDemo = computed(() => DEMOS.find((d) => d.key === activeKey.value))

function select(demo) {
  activeKey.value = demo.key
  activeComp.value = demo.comp
  mounted.value = true
}
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <header class="lab-head">
        <div>
          <h1>🧪 Vue 知识实验室</h1>
          <p class="muted">
            本站用到的所有 Vue 特性都在这里可以「点着看」：共 {{ DEMOS.length }} 个交互演示，
            覆盖 <a href="https://cn.vuejs.org/tutorial/" target="_blank" rel="noreferrer">Vue 官方教程</a> 的全部章节。
          </p>
        </div>
        <div class="row wrap">
          <button class="btn" @click="mounted = !mounted">
            {{ mounted ? '卸载演示组件' : '重新挂载演示组件' }}
          </button>
          <span class="tag">KeepAlive 已缓存 {{ cachedKeys.length }} 个组件</span>
        </div>
      </header>

      <div class="lab-body">
        <!-- 侧边目录：v-for 渲染，选中态用动态 class -->
        <aside class="lab-nav panel">
          <button
            v-for="d in DEMOS"
            :key="d.key"
            class="lab-nav__item"
            :class="{ 'is-on': d.key === activeKey }"
            @click="select(d)"
          >
            <span class="lab-nav__icon">{{ d.icon }}</span>
            <span class="lab-nav__text">
              <strong>{{ d.title }}</strong>
              <em>{{ d.chapter }}</em>
            </span>
          </button>
        </aside>

        <section class="lab-stage">
          <div class="panel stage-head">
            <h2>{{ activeDemo.icon }} {{ activeDemo.title }}</h2>
            <p class="small muted">
              对应官方教程章节：<strong>{{ activeDemo.chapter }}</strong>
            </p>
          </div>

          <!-- 动态组件 + KeepAlive：切换目录时组件实例被缓存，状态（比如计数、日志）不会丢；
               点「卸载演示组件」则真正销毁，可以观察子组件的 onUnmounted -->
          <div class="stage-body">
            <KeepAlive>
              <component :is="activeComp" v-if="mounted" :key="activeKey" />
            </KeepAlive>
            <div v-if="!mounted" class="panel center">
              <p>演示组件已卸载 🧹</p>
              <p class="small muted">
                刚才的卸载触发了子组件的 onBeforeUnmount / onUnmounted（顶部应该弹出了提示），
                其中 onUnmounted 里清理了定时器。点击「重新挂载演示组件」可以再看一次完整生命周期。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lab-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.lab-head h1 {
  font-size: 22px;
}

.lab-head p {
  margin: 6px 0 0;
  max-width: 620px;
  font-size: 13.5px;
}

.lab-head a {
  color: var(--brand-strong);
  text-decoration: underline;
}

.lab-body {
  display: grid;
  grid-template-columns: 262px 1fr;
  gap: 18px;
  align-items: start;
}

.lab-nav {
  display: grid;
  gap: 5px;
  padding: 12px;
  position: sticky;
  top: 82px;
}

.lab-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}

.lab-nav__item:hover {
  background: var(--bg-sunken);
}

.lab-nav__item.is-on {
  background: var(--brand-soft);
}

.lab-nav__icon {
  font-size: 17px;
}

.lab-nav__text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.lab-nav__text strong {
  font-size: 13.5px;
}

.lab-nav__text em {
  font-style: normal;
  font-size: 11px;
  color: var(--text-muted);
}

.lab-nav__item.is-on .lab-nav__text strong {
  color: var(--brand-strong);
}

.lab-stage {
  min-width: 0;
  display: grid;
  gap: 14px;
}

.stage-head h2 {
  font-size: 17px;
  margin-bottom: 4px;
}

.stage-body {
  min-height: 320px;
}

.center {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 900px) {
  .lab-body {
    grid-template-columns: 1fr;
  }
  .lab-nav {
    position: static;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>