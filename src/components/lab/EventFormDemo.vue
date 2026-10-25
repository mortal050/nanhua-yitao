<script setup>
/**
 * 演示 5：事件处理 + 表单输入绑定
 * 覆盖：v-on 简写、内联 vs 方法、事件修饰符（.stop .prevent .once .self .capture .passive）、
 *       按键修饰符（.enter .esc .exact）、鼠标修饰符、v-model 各种控件与修饰符
 */
import { ref } from 'vue'

const clicks = ref(0)
const log = ref([])
function record(e) {
  clicks.value++
  log.value.unshift(`第 ${clicks.value} 次点击 → 触发元素：${e.currentTarget.tagName}${e.target !== e.currentTarget ? '（事件从子元素冒泡上来）' : ''}`)
  if (log.value.length > 6) log.value.pop()
}

const outerClicks = ref(0)
const innerClicks = ref(0)
const onceClicks = ref(0)
const selfClicks = ref(0)

// 表单
const form = ref({
  nickname: '',
  age: null,
  gender: 'female',
  bio: '',
  hobbies: ['coding'],
  city: '',
  level: 3,
  agree: false,
})

const HOBBIES = [
  { value: 'coding', label: '写代码' },
  { value: 'basketball', label: '打篮球' },
  { value: 'reading', label: '读书' },
  { value: 'photography', label: '摄影' },
]

const CITIES = ['衡阳', '长沙', '广州', '深圳']

const submitted = ref(null)
function submit() {
  // @submit.prevent 已经阻止了默认的页面刷新
  submitted.value = JSON.parse(JSON.stringify(form.value))
}
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① v-on 与事件修饰符</h4>
      <div class="row wrap">
        <button class="btn" @click="record">普通点击</button>
        <button class="btn" @click.once="onceClicks++">只触发一次（.once）：{{ onceClicks }}</button>
        <!-- .stop：阻止冒泡；.self：只有点在元素本身时才触发 -->
        <div class="outer" @click="outerClicks++">
          外层（{{ outerClicks }}）
          <button class="btn small" @click.stop="innerClicks++">内层 .stop（{{ innerClicks }}）</button>
          <button class="btn small" @click="innerClicks++">内层不加 .stop（会冒泡）</button>
        </div>
        <div class="self-box" @click.self="selfClicks++">
          容器 .self（{{ selfClicks }}）
          <button class="btn small" @click="() => {}">点我不会 +1（点在按钮上不是 self）</button>
        </div>
      </div>

      <div class="row wrap" style="margin-top: 12px">
        <a class="btn" href="https://cn.vuejs.org/tutorial/" target="_blank" rel="noreferrer" @click.prevent="log.unshift('拦截了链接跳转（.prevent）')">
          Vue 官方教程链接（.prevent 拦截）
        </a>
        <!-- 滚动容器上用 .passive 提升滚动性能 -->
        <div class="scroll-box" @scroll.passive="() => {}">
          滚动我（.passive）—— 内容内容内容内容内容内容内容内容内容内容内容内容
        </div>
      </div>

      <label class="field" style="margin-top: 12px">
        <span class="field-label small">键盘修饰符：按 Enter 记录，按 Esc 清空</span>
        <input class="input" placeholder="试试按 Enter / Esc / Ctrl+Enter" @keyup.enter="log.unshift('Enter 被按下')" @keyup.esc="log = []" @keyup.ctrl.enter="log.unshift('Ctrl + Enter（组合修饰符）')" />
      </label>

      <ul class="log">
        <li v-for="(l, i) in log" :key="i">{{ l }}</li>
        <li v-if="!log.length" class="muted">事件日志会显示在这里</li>
      </ul>
    </div>

    <div class="demo__block">
      <h4>② v-model 表单绑定全家桶</h4>
      <form @submit.prevent="submit">
        <div class="grid-2">
          <label class="field">
            <span class="field-label small">文本框（.trim 自动去空格）</span>
            <input v-model.trim="form.nickname" class="input" placeholder="昵称" />
          </label>
          <label class="field">
            <span class="field-label small">数字框（.number 自动转数字）</span>
            <input v-model.number="form.age" class="input" type="number" placeholder="年龄" />
            <span class="field-hint">类型：{{ typeof form.age }} —— 用了 .number 就是 number</span>
          </label>
        </div>

        <div class="field">
          <span class="field-label small">单选框（绑定字符串）</span>
          <div class="row wrap">
            <label class="check small"><input v-model="form.gender" type="radio" value="female" /> 女</label>
            <label class="check small"><input v-model="form.gender" type="radio" value="male" /> 男</label>
            <label class="check small"><input v-model="form.gender" type="radio" value="secret" /> 保密</label>
            <span class="tag">当前：{{ form.gender }}</span>
          </div>
        </div>

        <div class="field">
          <span class="field-label small">复选框（绑定数组）</span>
          <div class="row wrap">
            <label v-for="h in HOBBIES" :key="h.value" class="check small">
              <input v-model="form.hobbies" type="checkbox" :value="h.value" />
              {{ h.label }}
            </label>
          </div>
          <span class="field-hint">已选：{{ form.hobbies.join('、') || '无' }}</span>
        </div>

        <div class="grid-2">
          <label class="field">
            <span class="field-label small">下拉选择（select）</span>
            <select v-model="form.city" class="select">
              <option value="">请选择城市</option>
              <option v-for="c in CITIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label small">滑块（range）</span>
            <input v-model.number="form.level" type="range" min="1" max="5" class="range" />
            <span class="field-hint">等级：{{ form.level }}</span>
          </label>
        </div>

        <label class="field">
          <span class="field-label small">多行文本（.lazy 失焦才同步）</span>
          <textarea v-model.lazy="form.bio" class="textarea" placeholder="失焦后才会看到下方变化"></textarea>
          <span class="field-hint">实时值：{{ form.bio || '（还没同步）' }}</span>
        </label>

        <label class="check small" style="margin-bottom: 12px">
          <input v-model="form.agree" type="checkbox" />
          我已阅读并同意《校园闲置交易守则》
        </label>

        <div class="row">
          <button class="btn btn-primary" type="submit" :disabled="!form.agree">提交表单</button>
          <span v-if="!form.agree" class="small muted">勾选协议后才能提交</span>
        </div>
      </form>

      <pre v-if="submitted" class="code">{{ JSON.stringify(submitted, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.outer,
.self-box {
  padding: 10px 14px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  background: var(--bg-sunken);
}

.scroll-box {
  height: 40px;
  overflow: auto;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  white-space: nowrap;
}

.log {
  margin-top: 12px;
  background: var(--bg-sunken);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 12.5px;
  display: grid;
  gap: 6px;
  max-height: 150px;
  overflow: auto;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

.range {
  width: 100%;
  accent-color: var(--brand);
}

.code {
  background: var(--bg-sunken);
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  overflow: auto;
  margin-top: 14px;
}

@media (max-width: 720px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>