<script setup>
/**
 * 演示 3：类与样式绑定 + 条件渲染
 * 覆盖：:class 对象/数组语法、:style 绑定、v-if / v-else-if / v-else、v-show、<template v-if>
 */
import { computed, ref } from 'vue'

const isActive = ref(true)
const hasError = ref(false)
const size = ref('md')
const rounded = ref(true)

const classObject = computed(() => ({
  'btn-demo--active': isActive.value,
  'btn-demo--error': hasError.value,
  [`btn-demo--${size.value}`]: true,
  'is-rounded': rounded.value,
}))

const styleObject = computed(() => ({
  '--hue': isActive.value ? '160' : '20',
  padding: size.value === 'lg' ? '18px 26px' : '12px 18px',
  fontWeight: hasError.value ? 800 : 500,
}))

// 条件渲染
const score = ref(76)
const showDetail = ref(false)
const level = computed(() => {
  if (score.value >= 90) return 'excellent'
  else if (score.value >= 75) return 'good'
  else if (score.value >= 60) return 'pass'
  return 'fail'
})
const LEVEL_TEXT = { excellent: '优秀 🏅', good: '良好 👍', pass: '及格 🙂', fail: '不及格 😢' }
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① :class 对象语法 / 数组语法</h4>
      <div class="row wrap">
        <label class="check small"><input v-model="isActive" type="checkbox" /> isActive</label>
        <label class="check small"><input v-model="hasError" type="checkbox" /> hasError</label>
        <label class="check small"><input v-model="rounded" type="checkbox" /> 圆角</label>
        <select v-model="size" class="select" style="width: auto">
          <option value="sm">sm</option>
          <option value="md">md</option>
          <option value="lg">lg</option>
        </select>
      </div>
      <!-- 对象语法（推荐）：键是类名，值是布尔 -->
      <div class="btn-demo" :class="classObject" :style="styleObject">
        当前类名：{{ Object.keys(classObject).filter((k) => classObject[k]).join(' ') || '（无）' }}
      </div>
      <p class="small muted">
        <code>class</code> 与 <code>:class</code> 可以共存，Vue 会把它们合并。
      </p>
    </div>

    <div class="demo__block">
      <h4>② :style 绑定</h4>
      <input v-model.number="score" type="range" min="0" max="100" class="range" />
      <div
        class="bar-demo"
        :style="{
          width: score + '%',
          background: `linear-gradient(90deg, hsl(${score * 1.2} 70% 45%), hsl(${score * 1.2 + 40} 70% 55%))`,
        }"
      />
      <p class="small muted">分数 {{ score }} 分 —— 宽度、颜色都由 :style 动态计算。</p>
    </div>

    <div class="demo__block">
      <h4>③ v-if / v-else-if / v-else 与 v-show</h4>
      <p>
        评级：
        <strong v-if="level === 'excellent'">{{ LEVEL_TEXT.excellent }}</strong>
        <strong v-else-if="level === 'good'">{{ LEVEL_TEXT.good }}</strong>
        <strong v-else-if="level === 'pass'">{{ LEVEL_TEXT.pass }}</strong>
        <strong v-else class="danger">{{ LEVEL_TEXT.fail }}</strong>
      </p>

      <div class="row wrap">
        <button class="btn small" @click="showDetail = !showDetail">
          {{ showDetail ? '隐藏' : '显示' }}额外说明（v-if）
        </button>
        <label class="check small">
          <input v-model="showDetail" type="checkbox" />
          同一状态也可用 v-show
        </label>
      </div>

      <!-- v-if：真正的条件渲染，会销毁/重建 DOM -->
      <div v-if="showDetail" class="hint-box">
        <p class="small">
          <strong>v-if</strong> 为假时元素会被真正从 DOM 中移除（可以通过开发者工具确认）。
        </p>
      </div>
      <!-- v-show：只是切换 display，元素始终在 DOM 中 -->
      <div v-show="showDetail" class="hint-box hint-box--show">
        <p class="small"><strong>v-show</strong> 只是加了 <code>display:none</code>，切换开销更小。</p>
      </div>

      <!-- <template v-if>：批量渲染时不会产生额外的包裹元素 -->
      <template v-if="score >= 60">
        <p class="small muted">✓ 已通过（这一行和下面一行被同一个 template v-if 包裹）</p>
        <p class="small muted">✓ template 本身不会渲染成真实元素</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.btn-demo {
  margin-top: 12px;
  border-radius: 6px;
  background: hsl(var(--hue) 45% 92%);
  color: hsl(var(--hue) 60% 22%);
  transition: all 0.3s var(--ease);
  display: inline-block;
}

.btn-demo.is-rounded {
  border-radius: 999px;
}

.btn-demo--sm {
  font-size: 12.5px;
}

.btn-demo--lg {
  font-size: 16px;
}

.btn-demo--active {
  outline: 2px solid hsl(var(--hue) 60% 40%);
}

.btn-demo--error {
  background: #ffe4e6;
  color: #9f1239;
  text-decoration: underline wavy;
}

.range {
  width: 100%;
  accent-color: var(--brand);
  margin-bottom: 10px;
}

.bar-demo {
  height: 16px;
  border-radius: 999px;
  transition: width 0.25s var(--ease), background 0.4s;
}

.hint-box {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--brand-soft);
  border-left: 3px solid var(--brand);
}

.hint-box--show {
  background: var(--accent-soft);
  border-left-color: var(--accent);
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

.danger {
  color: var(--danger);
}
</style>