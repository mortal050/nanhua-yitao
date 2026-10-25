<script setup>
/**
 * 演示 1：响应式基础 + 模板语法
 * 覆盖：ref() / reactive()、插值、v-bind、v-on、动态属性名、.value 的读写规则
 */
import { reactive, ref } from 'vue'

// ---- ref：可以包裹任意类型，模板中自动解包，脚本里要写 .value ----
const count = ref(0)
const nickname = ref('吴星雨')
const isVip = ref(false)
const attrs = reactive({ id: 'demo-box', title: '鼠标悬停看看' })
const dynamicAttr = ref('title') // 动态参数：v-bind:[dynamicAttr]

// ---- reactive：只能包裹对象/数组，深层都是响应式的 ----
const profile = reactive({
  name: '吴星雨',
  college: '计算机学院',
  tags: ['Vue', '前端'],
  stats: { posts: 3, favorites: 12 },
})

function inc(step = 1) {
  count.value += step
}

function addTag() {
  const n = profile.tags.length + 1
  profile.tags.push(`新标签${n}`)
}

function changeAttr() {
  dynamicAttr.value = dynamicAttr.value === 'title' ? 'data-tip' : 'title'
}
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① ref：基本类型的响应式</h4>
      <p class="small muted">
        点击按钮修改 <code>count.value</code>，模板里的插值 <code>count</code> 会自动更新。
      </p>
      <div class="row wrap">
        <button class="btn" @click="inc(-1)">-1</button>
        <strong class="big">{{ count }}</strong>
        <button class="btn btn-primary" @click="inc()">+1</button>
        <button class="btn" @click="count = 0">重置</button>
      </div>
      <p class="small muted">脚本里是 <code>count.value</code>，模板里直接写 <code>count</code> —— 这就是 ref 的自动解包。</p>
    </div>

    <div class="demo__block">
      <h4>② v-bind：属性绑定与动态参数</h4>
      <input v-model="nickname" class="input" placeholder="改个昵称试试" />
      <div class="row wrap" style="margin-top: 10px">
        <label class="check small">
          <input v-model="isVip" type="checkbox" />
          开通会员（切换 class）
        </label>
      </div>
      <!-- 对象语法绑定多个属性 + 动态参数名 -->
      <div
        v-bind="attrs"
        :[dynamicAttr]="'当前绑定的是 ' + dynamicAttr"
        class="badge-box"
        :class="{ 'is-vip': isVip }"
      >
        {{ nickname }}<span v-if="isVip">（VIP）</span>
      </div>
      <button class="btn btn-ghost small" @click="changeAttr">
        切换动态参数名（现在是 {{ dynamicAttr }}）
      </button>
    </div>

    <div class="demo__block">
      <h4>③ reactive：对象的深层响应式</h4>
      <div class="grid-2">
        <label class="field" style="margin: 0">
          <span class="field-label small">姓名</span>
          <input v-model="profile.name" class="input" />
        </label>
        <label class="field" style="margin: 0">
          <span class="field-label small">学院</span>
          <input v-model="profile.college" class="input" />
        </label>
      </div>
      <div class="row wrap" style="margin-top: 12px">
        <span v-for="t in profile.tags" :key="t" class="tag tag-brand">{{ t }}</span>
        <button class="btn small" @click="addTag">push 一个标签（数组也是响应式的）</button>
      </div>
      <pre class="code">{{ JSON.stringify(profile, null, 2) }}</pre>
      <p class="small muted">
        嵌套的 <code>profile.stats</code> 也是响应式的：修改 <code>stats.favorites</code> 同样会触发更新。
        <button class="link" @click="profile.stats.favorites++">收藏数 +1</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.big {
  font-size: 24px;
  min-width: 46px;
  text-align: center;
}

.badge-box {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  border: 1px dashed var(--border);
  display: inline-block;
}

.badge-box.is-vip {
  border-color: var(--accent);
  background: var(--accent-soft);
  font-weight: 700;
}

.code {
  background: var(--bg-sunken);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  overflow: auto;
  margin: 12px 0;
  max-height: 180px;
}

.link {
  border: none;
  background: transparent;
  color: var(--brand-strong);
  cursor: pointer;
  font-size: 12.5px;
}
</style>