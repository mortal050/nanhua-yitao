<script setup>
/**
 * 发表评价表单
 * 知识点：
 *  - v-model 在多种表单控件上的用法（input / textarea / 自定义组件 StarRating / checkbox）
 *  - 表单修饰符 .lazy .number .trim
 *  - defineEmits 向父组件提交数据
 *  - 表单校验 + 错误提示（computed + v-if）
 *  - 用 ref 引用 DOM 元素并手动聚焦（模板引用 + defineExpose）
 */
import { computed, ref } from 'vue'
import StarRating from '@/components/common/StarRating.vue'

const emit = defineEmits(['submit'])

const props = defineProps({
  maxLength: { type: Number, default: 200 },
})

const form = ref({
  author: '',
  content: '',
  rating: 5,
  anonymous: false,
})
const touched = ref(false)
const textareaRef = ref(null)

const errors = computed(() => {
  const e = {}
  if (!form.value.content.trim()) e.content = '评价内容不能为空'
  else if (form.value.content.trim().length < 5) e.content = '至少写 5 个字，方便同学参考'
  if (form.value.content.length > props.maxLength) e.content = `最多 ${props.maxLength} 个字`
  return e
})

const remain = computed(() => props.maxLength - form.value.content.length)
const canSubmit = computed(() => Object.keys(errors.value).length === 0)

function submit() {
  touched.value = true
  if (!canSubmit.value) {
    textareaRef.value?.focus()
    return
  }
  emit('submit', {
    author: form.value.author.trim() || (form.value.anonymous ? '匿名同学' : '热心同学'),
    avatar: form.value.anonymous ? '🕶️' : '🙂',
    rating: form.value.rating,
    content: form.value.content.trim(),
  })
  // 提交后重置表单
  form.value.content = ''
  form.value.rating = 5
  touched.value = false
}

/** 通过 defineExpose 把方法暴露给父组件（父组件用 ref 调用） */
defineExpose({
  focus: () => textareaRef.value?.focus(),
  reset: () => {
    form.value = { author: '', content: '', rating: 5, anonymous: false }
    touched.value = false
  },
})
</script>

<template>
  <div class="comment-form card">
    <h4 class="comment-form__title">写下你的交易体验</h4>

    <div class="comment-form__row">
      <label class="small muted">评分</label>
      <!-- 自定义组件上的 v-model：内部用 defineModel 接收 -->
      <StarRating v-model="form.rating" size="20px" show-text />
    </div>

    <div class="comment-form__row">
      <input v-model.lazy.trim="form.author" class="input" placeholder="昵称（留空则显示「热心同学」）" />
      <label class="check small">
        <input v-model="form.anonymous" type="checkbox" />
        匿名评价
      </label>
    </div>

    <textarea
      ref="textareaRef"
      v-model.trim="form.content"
      class="textarea"
      :placeholder="`说说商品成色、卖家态度…（${maxLength} 字以内）`"
      @blur="touched = true"
    />

    <div class="comment-form__foot">
      <span class="small" :class="remain < 20 ? 'warn' : 'muted'">还可输入 {{ remain }} 字</span>
      <span v-if="touched && errors.content" class="field-error">{{ errors.content }}</span>
      <span class="spacer" />
      <button class="btn btn-primary" :disabled="!canSubmit" @click="submit">发表评价</button>
    </div>
  </div>
</template>

<style scoped>
.comment-form {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.comment-form__title {
  font-size: 15px;
}

.comment-form__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
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

.comment-form__foot {
  display: flex;
  align-items: center;
  gap: 12px;
}

.warn {
  color: var(--accent);
}
</style>