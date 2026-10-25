<script setup>
/**
 * 演示 9：依赖注入 + 自定义指令 + 插件
 * 覆盖：provide / inject（含默认值、响应式、Symbol key）、应用层 provide、
 *       自定义指令 v-highlight / v-ripple、插件提供的 notify / $notify
 */
import { computed, inject, provide, ref } from 'vue'
import { useUserStore } from '@/stores/user'

// 1) 组件自身 provide：只有本组件的后代能注入
const scope = ref('本组件作用域')
const counter = ref(0)
provide('labScope', { scope, counter, bump: () => counter.value++ })

// Symbol 作为 key，避免命名冲突
const ThemeKey = Symbol('lab-theme')
provide(ThemeKey, computed(() => useUserStore().theme))

// 2) inject：读取祖先（App.vue）provide 的站点信息 + 插件提供的 notify
const siteInfo = inject('siteInfo', { name: '未知站点' })
const notify = inject('notify', () => {})
const labScope = inject('labScope', null)
const injectedTheme = inject(ThemeKey, ref('light'))

const highlightWords = ref('南华 校园 闲置')
const highlightText = ref('南华易淘是一个南华大学校园闲置交易平台，让闲置在校园里流动起来。')

// 3) 自定义指令演示
const useRipple = ref(true)
const keyword = computed(() => highlightWords.value)
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① provide / inject</h4>
      <ul class="mini">
        <li>来自 App.vue 的 provide（应用级）：站点名 = <strong>{{ siteInfo.name }}</strong>，学号作者：{{ siteInfo.slogan }}</li>
        <li>来自本组件的 provide：作用域 = <strong>{{ labScope?.scope }}</strong></li>
        <li>Symbol key 注入的主题：<strong>{{ injectedTheme }}</strong>（切换右上角主题看看）</li>
      </ul>
      <div class="row wrap">
        <button class="btn small" @click="labScope?.bump()">
          调用注入对象里的方法（计数器：{{ labScope?.counter }}）
        </button>
        <button class="btn small" @click="notify('这是通过 inject(\'notify\') 调用的提示', 'success')">
          inject('notify') 调用全局提示
        </button>
        <!-- 插件还把 notify 挂到了 globalProperties 上，模板里可以直接用 $notify -->
        <button class="btn small" @click="$notify('这是通过 $notify 全局属性调用的', 'info')">
          this.$notify 全局属性
        </button>
      </div>
      <p class="small muted">
        provide/inject 解决的是「深层嵌套传参」问题：中间组件不需要关心这些数据，也不用一层层写 props。
      </p>
    </div>

    <div class="demo__block">
      <h4>② 自定义指令 v-highlight</h4>
      <div class="grid-2">
        <label class="field" style="margin: 0">
          <span class="field-label small">高亮关键词（空格分隔）</span>
          <input v-model="highlightWords" class="input" />
        </label>
        <label class="field" style="margin: 0">
          <span class="field-label small">被处理的文本</span>
          <textarea v-model="highlightText" class="textarea" />
        </label>
      </div>
      <!-- 指令：v-highlight="关键词"，指令内部会重写元素的 innerHTML 并加上 <mark> -->
      <p class="hl-target" v-highlight="keyword">{{ highlightText }}</p>
      <p class="small muted">
        实现位置：<code>src/directives/highlight.js</code>，在 <code>main.js</code> 里用
        <code>app.directive('highlight', highlight)</code> 全局注册。
      </p>
    </div>

    <div class="demo__block">
      <h4>③ 自定义指令 v-ripple</h4>
      <div class="row wrap">
        <button class="btn btn-primary" v-ripple>点我看水波纹</button>
        <button class="btn btn-accent" v-ripple.slow="'rgba(255,255,255,0.7)'">
          慢速 + 自定义颜色（v-ripple.slow="'颜色'"）
        </button>
        <span class="ripple-box" v-ripple="'rgba(15,157,118,0.35)'">普通元素也能用指令</span>
      </div>
      <p class="small muted">
        指令内部在 mounted 中绑定事件、unmounted 中解绑，演示了「副作用必须成对清理」的规范。
      </p>
    </div>
  </div>
</template>

<style scoped>
.mini {
  display: grid;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 12px;
}

.hl-target {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  line-height: 1.9;
}

/* v-highlight 生成的 mark 在指令的 render 里创建，属于本组件模板的子节点，直接写样式即可 */
:deep(mark.ny-hl) {
  background: linear-gradient(180deg, transparent 52%, color-mix(in srgb, var(--accent) 70%, transparent) 52%);
  color: inherit;
  padding: 0 2px;
  border-radius: 3px;
}

.ripple-box {
  padding: 10px 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-sunken);
  cursor: pointer;
  font-size: 13.5px;
  display: inline-block;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 16px;
}

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>