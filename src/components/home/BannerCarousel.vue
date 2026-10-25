<script setup>
/**
 * 首页轮播（Banner）
 * 知识点：
 *  - 生命周期：onMounted 启动定时器，onUnmounted 清理（重要！否则组件销毁后定时器仍在跑）
 *  - 模板引用 ref 拿到轮播容器 DOM
 *  - <TransitionGroup> / 动态 style 位移
 *  - 事件处理：鼠标移入暂停自动播放
 *  - 组合式函数化的逻辑（把索引轮播抽象成 useCarousel 也是常见做法，这里直接写在组件里）
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BANNERS } from '@/data/items'

const router = useRouter()

const banners = ref(BANNERS)
const index = ref(0)
const paused = ref(false)
const trackRef = ref(null) // 模板引用示例
let timer = null

const current = computed(() => banners.value[index.value])

function next() {
  index.value = (index.value + 1) % banners.value.length
}

function prev() {
  index.value = (index.value - 1 + banners.value.length) % banners.value.length
}

function goTo(i) {
  index.value = i
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (!paused.value) next()
  }, 4200)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/** 点击 CTA：按分类跳到市场页 */
const CATEGORY_OF_BANNER = ['book', 'exam', 'daily']

function handleAction() {
  router.push({ name: 'market', query: { category: CATEGORY_OF_BANNER[index.value] } })
}

onMounted(() => {
  startTimer()
  // 演示：拿到真实 DOM 元素（模板引用不是响应式的，直接访问即可）
  console.log('[Banner] 轮播容器宽度：', trackRef.value?.clientWidth)
})

// 组件卸载时清理定时器 —— 不加这一句会造成内存泄漏
onUnmounted(stopTimer)
</script>

<template>
  <section
    ref="trackRef"
    class="banner"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <Transition name="slide" mode="out-in">
      <div :key="index" class="banner__slide">
        <div class="banner__text">
          <span class="banner__tag">校园闲置 · 第 {{ index + 1 }} / {{ banners.length }} 期</span>
          <h2>{{ current.title }}</h2>
          <p>{{ current.desc }}</p>
          <button class="btn btn-primary" @click="handleAction">{{ current.action }}</button>
        </div>
        <div class="banner__emoji">{{ current.emoji }}</div>
      </div>
    </Transition>

    <button class="banner__nav banner__nav--prev" aria-label="上一张" @click="prev">‹</button>
    <button class="banner__nav banner__nav--next" aria-label="下一张" @click="next">›</button>

    <div class="banner__dots">
      <button
        v-for="(b, i) in banners"
        :key="b.title"
        class="banner__dot"
        :class="{ 'is-on': i === index }"
        :aria-label="`第 ${i + 1} 张`"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<style scoped>
.banner {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 55%, #084f3c 100%);
  color: #fff;
  min-height: 250px;
  display: grid;
  box-shadow: var(--shadow);
}

[data-theme='dark'] .banner {
  background: linear-gradient(135deg, #0f3d31 0%, #0b2b24 60%, #07211b 100%);
}

.banner__slide {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 38px 64px;
}

.banner__tag {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
  margin-bottom: 12px;
}

.banner__text h2 {
  font-size: 28px;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}

.banner__text p {
  margin: 0 0 20px;
  max-width: 460px;
  opacity: 0.9;
  font-size: 14px;
}

.banner__emoji {
  font-size: 110px;
  line-height: 1;
  opacity: 0.9;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.28));
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-12px) rotate(3deg);
  }
}

.banner__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.banner__nav:hover {
  background: rgba(255, 255, 255, 0.34);
}

.banner__nav--prev {
  left: 12px;
}

.banner__nav--next {
  right: 12px;
}

.banner__dots {
  position: absolute;
  bottom: 16px;
  left: 64px;
  display: flex;
  gap: 7px;
}

.banner__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.42);
  cursor: pointer;
  padding: 0;
  transition: all 0.25s var(--ease);
}

.banner__dot.is-on {
  width: 24px;
  border-radius: 999px;
  background: #fff;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s var(--ease);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

@media (max-width: 720px) {
  .banner__slide {
    padding: 26px 22px 40px 56px;
  }
  .banner__text h2 {
    font-size: 21px;
  }
  .banner__emoji {
    font-size: 62px;
  }
  .banner__dots {
    left: 56px;
  }
  .banner__nav {
    width: 30px;
    height: 30px;
    font-size: 17px;
  }
}
</style>