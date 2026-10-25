<script setup>
/**
 * 计数面板（子组件）
 * 用于演示：props 声明与校验、emits 自定义事件、组件上的 v-model（defineModel）、
 *           透传 attribute（inheritAttrs: false + v-bind="$attrs"）、defineExpose
 */
import { computed, ref } from 'vue'

// inheritAttrs: false → 父组件传下来的非 props 属性不再自动挂到根元素，改由 $attrs 手动指定位置
defineOptions({ inheritAttrs: false })

const props = defineProps({
  title: { type: String, required: true },
  /** props 校验：只允许这三个值 */
  theme: {
    type: String,
    default: 'brand',
    validator: (v) => ['brand', 'accent', 'danger'].includes(v),
  },
  step: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
})

// v-model:count → 等价于 prop "count" + 事件 "update:count"，
// 所以不要再在 defineProps 里重复声明 count，否则会重复定义。
const emit = defineEmits(['reach-max', 'change'])

const model = defineModel('count', { type: Number, default: 0 })

const inner = ref(0)
const percent = computed(() => Math.min(100, Math.round((model.value / props.max) * 100)))

function add() {
  if (model.value >= props.max) {
    emit('reach-max', props.max)
    return
  }
  model.value = Math.min(props.max, model.value + props.step)
  inner.value += 1
  emit('change', { value: model.value, innerClicks: inner.value })
}

function reset() {
  model.value = 0
}

// 通过 defineExpose 暴露给父组件（父组件用 ref 调用）
defineExpose({ reset, inner })
</script>

<template>
  <div class="counter" :class="`counter--${theme}`">
    <!-- $attrs 手动绑定到内部元素：父组件传的 class / id / data-* / 事件监听都在这里 -->
    <header class="counter__head" v-bind="$attrs">
      <strong>{{ title }}</strong>
      <span class="small muted">{{ model }} / {{ max }}</span>
    </header>

    <div class="counter__bar">
      <div class="counter__fill" :style="{ width: percent + '%' }" />
    </div>

    <div class="row wrap">
      <button class="btn small" :disabled="model <= 0" @click="model = Math.max(0, model - step)">-{{ step }}</button>
      <button class="btn small btn-primary" @click="add">+{{ step }}</button>
      <span class="small muted">内部点击次数：{{ inner }}</span>
    </div>
  </div>
</template>

<style scoped>
.counter {
  padding: 14px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  display: grid;
  gap: 10px;
  min-width: 220px;
}

.counter__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.counter__bar {
  height: 8px;
  border-radius: 999px;
  background: var(--bg-sunken);
  overflow: hidden;
}

.counter__fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s var(--ease);
  background: var(--brand);
}

.counter--accent .counter__fill {
  background: var(--accent);
}

.counter--danger .counter__fill {
  background: var(--danger);
}

.counter--accent {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
}

.counter--danger {
  border-color: color-mix(in srgb, var(--danger) 45%, var(--border));
}
</style>