<script setup>
/**
 * 演示 4：列表渲染
 * 覆盖：v-for 遍历数组/对象/数字、:key 的作用、数组变更方法、过滤与排序、v-for 与 v-if 的正确配合
 */
import { computed, ref } from 'vue'

const todos = ref([
  { id: 1, text: '整理考研资料并拍照', done: true, priority: 2 },
  { id: 2, text: '给旧自行车打气、擦车', done: false, priority: 1 },
  { id: 3, text: '和买家约图书馆门口面交', done: false, priority: 3 },
])

const newText = ref('')
const newPriority = ref(1)
let seed = 100

// ---- 数组的变更方法：push / unshift / splice / sort / reverse 都会触发更新 ----
function add() {
  if (!newText.value.trim()) return
  todos.value.push({ id: ++seed, text: newText.value.trim(), done: false, priority: newPriority.value })
  newText.value = ''
}

function removeAt(id) {
  const idx = todos.value.findIndex((t) => t.id === id)
  todos.value.splice(idx, 1)
}

/** 用新数组替换（filter/map/concat 这些返回新数组的方法，本质是替换引用） */
function clearDone() {
  todos.value = todos.value.filter((t) => !t.done)
}

function sortByPriority() {
  todos.value.sort((a, b) => b.priority - a.priority)
}

const remain = computed(() => todos.value.filter((t) => !t.done).length)

// ---- v-for 遍历对象 ----
const objectExample = { 标题: '罗技鼠标', 价格: 89, 成色: '九成新' }

// ---- v-for 遍历数字 ----
const stars = ref(4)
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① v-for 渲染数组 + key</h4>
      <div class="row wrap">
        <input v-model="newText" class="input" style="flex: 1; min-width: 200px" placeholder="添加一条待办…" @keyup.enter="add" />
        <select v-model.number="newPriority" class="select" style="width: auto">
          <option :value="1">低优先级</option>
          <option :value="2">中优先级</option>
          <option :value="3">高优先级</option>
        </select>
        <button class="btn btn-primary" @click="add">添加</button>
      </div>

      <p class="small muted" style="margin-top: 10px">未完成 {{ remain }} 条</p>

      <ul class="todo">
        <li v-for="(t, index) in todos" :key="t.id" class="todo__item">
          <!-- key 必须是唯一且稳定的：这里用 t.id 而不是 index -->
          <span class="todo__idx">#{{ index + 1 }}</span>
          <input v-model="t.done" type="checkbox" />
          <span class="todo__text" :class="{ 'is-done': t.done }">{{ t.text }}</span>
          <span class="tag" :class="`p-${t.priority}`">优先级 {{ t.priority }}</span>
          <button class="link" @click="removeAt(t.id)">删除</button>
        </li>
      </ul>

      <div class="row wrap">
        <button class="btn small" @click="clearDone">filter 过滤未完成</button>
        <button class="btn small" @click="sortByPriority">sort 按优先级排序</button>
        <button class="btn small" @click="todos.reverse()">reverse 反转</button>
      </div>
      <p class="small muted">
        提示：用 <code>index</code> 当 key 时，删除中间项会导致复用错位（输入框内容串行）—— 这就是 key 的意义。
      </p>
    </div>

    <div class="demo__block">
      <h4>② v-for 遍历对象 / 数字 / 字符串</h4>
      <div class="grid-3">
        <div>
          <p class="small muted">遍历对象：(value, key, index)</p>
          <ul class="mini">
            <li v-for="(v, k, i) in objectExample" :key="k">{{ i }}. {{ k }}：{{ v }}</li>
          </ul>
        </div>
        <div>
          <p class="small muted">遍历数字 1..n</p>
          <div class="row">
            <span v-for="n in stars" :key="n" class="star">★</span>
            <button class="btn small" @click="stars = stars === 5 ? 3 : 5">切换</button>
          </div>
        </div>
        <div>
          <p class="small muted">v-for 的范围也支持变量</p>
          <span v-for="i in 3" :key="i" class="tag">第{{ i }}名</span>
        </div>
      </div>
    </div>

    <div class="demo__block">
      <h4>③ v-for 与 v-if 的正确配合</h4>
      <ul class="mini">
        <!-- 不推荐：v-if 与 v-for 同级（v-if 优先级更高，拿不到 item） -->
        <!-- 推荐：先用 computed 过滤，再 v-for -->
        <li v-for="t in todos.filter((x) => x.priority >= 2)" :key="t.id">
          ⚡ 高优先级：{{ t.text }}
        </li>
        <li v-if="!todos.some((x) => x.priority >= 2)" class="muted">没有高优先级任务</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.todo {
  display: grid;
  gap: 8px;
  margin: 12px 0;
}

.todo__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  font-size: 13.5px;
}

.todo__idx {
  color: var(--text-muted);
  font-size: 12px;
  min-width: 22px;
}

.todo__text {
  flex: 1;
}

.todo__text.is-done {
  text-decoration: line-through;
  color: var(--text-muted);
}

.p-1 {
  border-color: var(--border);
}

.p-2 {
  color: var(--accent);
  border-color: var(--accent);
}

.p-3 {
  color: var(--danger);
  border-color: var(--danger);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.mini {
  display: grid;
  gap: 5px;
  font-size: 13px;
}

.star {
  color: var(--accent);
  font-size: 18px;
}

.link {
  border: none;
  background: transparent;
  color: var(--danger);
  cursor: pointer;
  font-size: 12.5px;
}
</style>