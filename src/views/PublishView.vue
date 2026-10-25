<script setup>
/**
 * 发布闲置页
 * 知识点：
 *  - v-model 在 input / textarea / select / checkbox / radio / 数组多选 上的全部用法
 *  - 表单修饰符：.number（自动转数字）、.trim、.lazy（change 时才同步）
 *  - computed 表单校验 + 提交按钮禁用
 *  - 实时预览：同一个数据源驱动「表单」和「预览卡片」两处 UI（单向数据流的直观体现）
 *  - 调用 Pinia action 写入数据 → 路由跳转到新商品详情页
 *  - 在路由守卫保护的页面里读取 userStore（未登录会被重定向到首页）
 */
import { computed, inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES, CONDITIONS, CAMPUS_SPOTS, coverGradient } from '@/data/categories'
import { useMarketStore } from '@/stores/market'
import { useUserStore } from '@/stores/user'
import { useCurrency } from '@/composables'
import BaseModal from '@/components/common/BaseModal.vue'
import StarRating from '@/components/common/StarRating.vue'

const router = useRouter()
const market = useMarketStore()
const userStore = useUserStore()
const notify = inject('notify')
const money = useCurrency()

const submitting = ref(false)
const showSuccess = ref(false)
const createdId = ref('')
const formRef = ref(null)

/** 表单数据：用 reactive 组织多个相关字段（对比 ref：reactive 更适合对象） */
const form = reactive({
  title: '',
  category: 'book',
  price: null,
  originalPrice: null,
  condition: CONDITIONS[1],
  spot: CAMPUS_SPOTS[0],
  contact: '',
  tags: [], // 复选框绑定数组
  delivery: 'meet', // 单选框绑定字符串
  negotiable: true,
  description: '',
  rating: 5,
})

const TAG_OPTIONS = ['急出', '可议价', '全新', '考研', '宿舍神器', '可试骑', '打包出']

/** 表单校验规则：返回错误对象 */
const errors = computed(() => {
  const e = {}
  if (!form.title.trim()) e.title = '请填写商品标题'
  else if (form.title.trim().length < 4) e.title = '标题至少 4 个字'
  if (form.price === null || form.price === '' || Number(form.price) < 0) e.price = '请填写合理的价格'
  else if (Number(form.price) > 99999) e.price = '价格不能超过 99999'
  if (form.originalPrice !== null && form.originalPrice !== '' && Number(form.originalPrice) < Number(form.price))
    e.originalPrice = '原价不能低于现价'
  if (!form.contact.trim()) e.contact = '请留下联系方式（QQ / 微信 / 手机号）'
  else if (!/^[\w.@+-]{4,20}$|^1[3-9]\d{9}$/.test(form.contact.trim()))
    e.contact = '联系方式格式看起来不太对'
  if (form.description.trim().length < 10) e.description = '描述至少 10 个字，方便同学判断成色'
  return e
})

const errorCount = computed(() => Object.keys(errors.value).length)
const progress = computed(() => {
  const total = 6
  let done = 0
  if (form.title.trim().length >= 4) done++
  if (form.price) done++
  if (form.contact.trim()) done++
  if (form.description.trim().length >= 10) done++
  if (form.tags.length) done++
  if (form.spot) done++
  return Math.round((done / total) * 100)
})

const previewCover = computed(() => coverGradient(form.category, 5))

/** 提交：先校验，再调用 store action */
function submit() {
  if (errorCount.value) {
    notify(`还有 ${errorCount.value} 项没填好，请检查表单`, 'warn')
    formRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  submitting.value = true
  // 模拟请求耗时，展示按钮 loading 状态
  setTimeout(() => {
    const item = market.addItem({
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || Number(form.price),
      condition: form.condition,
      spot: form.spot,
      contact: form.contact.trim(),
      tags: form.tags.length ? form.tags : [form.condition],
      description: form.description.trim(),
      negotiable: form.negotiable,
      delivery: form.delivery,
      sellerRating: form.rating,
    })
    createdId.value = item.id
    submitting.value = false
    showSuccess.value = true
    notify('发布成功！已出现在市场列表顶部', 'success')
    resetForm()
  }, 620)
}

function resetForm() {
  Object.assign(form, {
    title: '',
    category: 'book',
    price: null,
    originalPrice: null,
    condition: CONDITIONS[1],
    spot: CAMPUS_SPOTS[0],
    contact: '',
    tags: [],
    delivery: 'meet',
    negotiable: true,
    description: '',
    rating: 5,
  })
}

function goDetail() {
  showSuccess.value = false
  router.push({ name: 'item-detail', params: { id: createdId.value } })
}
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <header class="pub-head">
        <div>
          <h1>发布闲置</h1>
          <p class="muted small">
            当前登录：{{ userStore.displayName }}（{{ userStore.user?.college }}）· 填写越完整，成交越快
          </p>
        </div>
        <div class="progress">
          <div class="progress__bar">
            <div class="progress__fill" :style="{ width: progress + '%' }" />
          </div>
          <span class="small muted">资料完整度 {{ progress }}%</span>
        </div>
      </header>

      <div class="pub-body">
        <!-- 表单 -->
        <form ref="formRef" class="panel pub-form" @submit.prevent="submit">
          <h3 class="section-title">基本信息</h3>

          <label class="field">
            <span class="field-label">商品标题<span class="req">*</span></span>
            <input v-model.trim="form.title" class="input" maxlength="40" placeholder="例如：九成新 罗技 M330 无线鼠标" />
            <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
            <span v-else class="field-hint">还剩 {{ 40 - form.title.length }} 字</span>
          </label>

          <div class="field-row">
            <label class="field">
              <span class="field-label">分类<span class="req">*</span></span>
              <select v-model="form.category" class="select">
                <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">成色</span>
              <select v-model="form.condition" class="select">
                <option v-for="c in CONDITIONS" :key="c" :value="c">{{ c }}</option>
              </select>
            </label>
          </div>

          <div class="field-row">
            <!-- .number 修饰符：自动把输入转成数字类型 -->
            <label class="field">
              <span class="field-label">现价（元）<span class="req">*</span></span>
              <input v-model.number="form.price" class="input" type="number" min="0" placeholder="0" />
              <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
            </label>

            <label class="field">
              <span class="field-label">原价（元）</span>
              <input v-model.number="form.originalPrice" class="input" type="number" min="0" placeholder="选填，用于展示折扣" />
              <span v-if="errors.originalPrice" class="field-error">{{ errors.originalPrice }}</span>
            </label>
          </div>

          <label class="field">
            <span class="field-label">交易地点<span class="req">*</span></span>
            <select v-model="form.spot" class="select">
              <option v-for="s in CAMPUS_SPOTS" :key="s" :value="s">📍 {{ s }}</option>
            </select>
          </label>

          <h3 class="section-title">交易方式</h3>

          <div class="field">
            <span class="field-label">交付方式</span>
            <div class="radios">
              <!-- 单选框：v-model 绑定同一个变量，value 决定选中值 -->
              <label class="radio"><input v-model="form.delivery" type="radio" value="meet" /> 校内面交</label>
              <label class="radio"><input v-model="form.delivery" type="radio" value="dorm" /> 送到宿舍楼下</label>
              <label class="radio"><input v-model="form.delivery" type="radio" value="express" /> 快递到付</label>
            </div>
          </div>

          <div class="field">
            <span class="field-label">标签（可多选）</span>
            <div class="checks">
              <!-- 复选框 + 数组：选中项的 value 会 push 进 form.tags -->
              <label v-for="t in TAG_OPTIONS" :key="t" class="check">
                <input v-model="form.tags" type="checkbox" :value="t" />
                <span>{{ t }}</span>
              </label>
            </div>
          </div>

          <label class="switch">
            <input v-model="form.negotiable" type="checkbox" />
            <span>接受小刀（可议价）</span>
          </label>

          <h3 class="section-title">描述与联系方式</h3>

          <label class="field">
            <span class="field-label">详细描述<span class="req">*</span></span>
            <textarea
              v-model.trim="form.description"
              class="textarea"
              maxlength="300"
              placeholder="购买时间、使用次数、有无磕碰、附赠配件……"
            />
            <span v-if="errors.description" class="field-error">{{ errors.description }}</span>
            <span v-else class="field-hint">{{ form.description.length }} / 300</span>
          </label>

          <label class="field">
            <span class="field-label">联系方式<span class="req">*</span></span>
            <!-- .lazy：只在 change（失焦）时同步，减少渲染次数 -->
            <input v-model.lazy.trim="form.contact" class="input" placeholder="QQ 号 / 微信号 / 手机号" />
            <span v-if="errors.contact" class="field-error">{{ errors.contact }}</span>
          </label>

          <div class="field">
            <span class="field-label">给自己打个信用印象分</span>
            <StarRating v-model="form.rating" size="22px" show-text />
          </div>

          <div class="pub-form__foot">
            <button type="button" class="btn" @click="resetForm">重置</button>
            <button type="submit" class="btn btn-primary btn-lg" :disabled="submitting || errorCount > 0">
              {{ submitting ? '发布中…' : errorCount ? `还有 ${errorCount} 项待完善` : '确认发布' }}
            </button>
          </div>
        </form>

        <!-- 实时预览：与表单共享同一份响应式数据 -->
        <aside class="pub-side">
          <div class="panel">
            <h3 class="section-title">实时预览</h3>
            <div class="preview card">
              <div class="preview__cover" :style="{ background: previewCover }">
                <span>{{ CATEGORIES.find((c) => c.id === form.category)?.icon }}</span>
              </div>
              <div class="preview__body">
                <strong>{{ form.title || '（还没写标题）' }}</strong>
                <div class="preview__price">
                  <em>{{ form.price ? money(form.price) : '¥ --' }}</em>
                  <s v-if="form.originalPrice" class="muted">{{ money(form.originalPrice) }}</s>
                </div>
                <p class="small muted preview__desc">
                  {{ form.description || '（描述会显示在这里）' }}
                </p>
                <div class="row wrap" style="gap: 6px">
                  <span class="tag">{{ form.condition }}</span>
                  <span class="tag">📍 {{ form.spot }}</span>
                  <span v-for="t in form.tags" :key="t" class="tag tag-brand">{{ t }}</span>
                </div>
              </div>
            </div>
            <p class="small muted" style="margin-top: 12px">
              这段预览没有写一行额外逻辑：它直接读取上面的 <code>form</code>，这就是「数据驱动视图」。
            </p>
          </div>

          <div class="panel">
            <h3 class="section-title">知识点清单</h3>
            <ul class="small muted tips">
              <li>v-model 绑定 input / textarea / select / checkbox / radio</li>
              <li>修饰符 .number / .trim / .lazy</li>
              <li>数组多选（复选框绑定数组）</li>
              <li>computed 校验 + 按钮禁用</li>
              <li>@submit.prevent 阻止表单默认提交</li>
            </ul>
          </div>
        </aside>
      </div>

      <!-- 发布成功弹窗 -->
      <BaseModal v-model="showSuccess" title="🎉 发布成功">
        <p>你的闲置已经上架，刷新市场页即可看到（数据保存在 localStorage）。</p>
        <template #footer="{ close }">
          <button class="btn" @click="close">继续发布</button>
          <button class="btn btn-primary" @click="goDetail">查看商品详情</button>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<style scoped>
.pub-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.pub-head h1 {
  font-size: 22px;
}

.pub-head p {
  margin: 4px 0 0;
}

.progress {
  min-width: 220px;
}

.progress__bar {
  height: 8px;
  border-radius: 999px;
  background: var(--bg-sunken);
  overflow: hidden;
  margin-bottom: 5px;
}

.progress__fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand), var(--accent));
  transition: width 0.4s var(--ease);
}

.pub-body {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 20px;
  align-items: start;
}

.pub-form {
  display: block;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.radios,
.checks {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.radio,
.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  cursor: pointer;
}

.radio input,
.check input {
  accent-color: var(--brand);
  width: 15px;
  height: 15px;
}

.switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg-sunken);
  margin-bottom: 18px;
}

.switch input {
  accent-color: var(--brand);
  width: 16px;
  height: 16px;
}

.pub-form__foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.btn-lg {
  padding: 12px 26px;
}

.pub-side {
  display: grid;
  gap: 16px;
  position: sticky;
  top: 82px;
}

.preview__cover {
  height: 120px;
  border-radius: var(--radius) var(--radius) 0 0;
  display: grid;
  place-items: center;
  font-size: 40px;
}

.preview__body {
  padding: 13px 15px;
  display: grid;
  gap: 7px;
}

.preview__price em {
  font-style: normal;
  font-size: 20px;
  font-weight: 800;
  color: var(--danger);
  margin-right: 8px;
}

.preview__desc {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tips li {
  margin-bottom: 6px;
  padding-left: 14px;
  position: relative;
}

.tips li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--brand);
  font-weight: 700;
}

code {
  background: var(--bg-sunken);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12.5px;
}

@media (max-width: 900px) {
  .pub-body {
    grid-template-columns: 1fr;
  }
  .pub-side {
    position: static;
  }
}
</style>