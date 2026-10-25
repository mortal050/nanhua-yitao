<script setup>
/**
 * 星级评分（可交互 / 只读两种模式）
 * 知识点：
 *  - defineModel 实现组件上的 v-model（父组件：<StarRating v-model="form.rating" />）
 *  - defineProps 类型、默认值、validator 校验
 *  - v-for + 动态 class + 事件修饰符
 */
const model = defineModel({ type: Number, default: 0 })

const props = defineProps({
  max: { type: Number, default: 5, validator: (v) => v > 0 && v <= 10 },
  readonly: { type: Boolean, default: false },
  size: { type: String, default: '16px' },
  showText: { type: Boolean, default: false },
})

const TEXT = ['很差', '一般', '还不错', '满意', '非常满意']

function setValue(n) {
  if (props.readonly) return
  model.value = n
}
</script>

<template>
  <div class="stars" :class="{ 'is-readonly': readonly }" :style="{ '--sz': size }">
    <button
      v-for="n in props.max"
      :key="n"
      type="button"
      class="stars__item"
      :class="{ 'is-on': n <= model }"
      :disabled="readonly"
      :aria-label="`${n} 星`"
      @click="setValue(n)"
    >
      ★
    </button>
    <span v-if="showText && model" class="stars__text muted">
      {{ TEXT[model - 1] || '' }}（{{ model }} 分）
    </span>
  </div>
</template>

<style scoped>
.stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.stars__item {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: var(--sz);
  line-height: 1;
  color: var(--border);
  transition: transform 0.15s var(--ease), color 0.2s;
  padding: 0 1px;
}

.stars__item.is-on {
  color: var(--accent);
}

.stars__item:hover:not(:disabled) {
  transform: scale(1.18);
}

.stars.is-readonly .stars__item {
  cursor: default;
}

.stars__text {
  font-size: 12.5px;
  margin-left: 6px;
}
</style>