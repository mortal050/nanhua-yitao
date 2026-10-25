<script setup>
/**
 * 关于本站
 * 知识点：
 *  - 路由 hash 锚点跳转（scrollBehavior 已在 router 中配置）
 *  - v-for 渲染知识点清单表格（数据驱动）
 *  - computed 统计知识点数量
 */
import { computed, ref } from 'vue'

const siteInfo = ref({
  name: '南华易淘',
  version: '1.0.0',
  course: 'Web 全栈开发',
  author: '吴星雨',
  studentId: '20244081131',
  className: '24 数信 01 班',
  college: '计算机学院',
})

/** 技术栈 */
const stack = [
  { name: 'Vue 3.5', desc: '组合式 API、<script setup> 单文件组件', icon: '🟩' },
  { name: 'Vite 6', desc: '开发服务器与生产构建，支持按需分包', icon: '⚡' },
  { name: 'Vue Router 4', desc: 'Hash 模式路由、动态路由、守卫、懒加载', icon: '🧭' },
  { name: 'Pinia 2', desc: 'Setup Store 写法管理全局状态', icon: '🍍' },
  { name: '原生 CSS', desc: 'CSS 变量设计系统 + 深色模式', icon: '🎨' },
  { name: 'localStorage', desc: '纯前端持久化（收藏 / 发布 / 评论 / 主题）', icon: '💾' },
]

/** 知识点 → 对应文件对照表（按官方教程章节组织） */
const knowledge = [
  { chapter: '创建一个应用', where: 'main.js（createApp / use / mount）', done: true },
  { chapter: '模板语法', where: 'ReactivityDemo.vue（插值、v-bind、动态参数）', done: true },
  { chapter: '响应式基础', where: 'ReactivityDemo.vue（ref / reactive）', done: true },
  { chapter: '计算属性', where: 'ComputedWatchDemo.vue、MarketView.vue', done: true },
  { chapter: 'Class 与 Style 绑定', where: 'ClassStyleDemo.vue、ItemCard.vue', done: true },
  { chapter: '条件渲染', where: 'ClassStyleDemo.vue、DetailView（v-if/v-else）', done: true },
  { chapter: '列表渲染', where: 'ListRenderDemo.vue、ItemGrid.vue', done: true },
  { chapter: '事件处理', where: 'EventFormDemo.vue（含 6 种事件修饰符）', done: true },
  { chapter: '表单输入绑定', where: 'EventFormDemo.vue、PublishView.vue', done: true },
  { chapter: '生命周期钩子', where: 'LifecycleDemo.vue、BannerCarousel.vue', done: true },
  { chapter: '侦听器 watch / watchEffect', where: 'ComputedWatchDemo.vue、stores/market.js', done: true },
  { chapter: '模板引用 ref / useTemplateRef', where: 'AsyncRefDemo.vue、SearchBar.vue', done: true },
  { chapter: '组件基础与注册', where: 'main.js 全局注册、各视图局部注册', done: true },
  { chapter: 'Props 与自定义事件', where: 'CounterPanel.vue（props 校验 + emits）', done: true },
  { chapter: '组件 v-model（defineModel）', where: 'BaseModal / StarRating / CounterPanel', done: true },
  { chapter: '透传 attribute（$attrs）', where: 'ItemGrid.vue、CounterPanel.vue', done: true },
  { chapter: '插槽（默认/具名/作用域/动态）', where: 'SlotDemo.vue、BaseModal.vue、CommentList.vue', done: true },
  { chapter: '依赖注入 provide / inject', where: 'App.vue、ProvideDirectiveDemo.vue', done: true },
  { chapter: '异步组件与 Suspense', where: 'AsyncRefDemo.vue、HomeView.vue', done: true },
  { chapter: '组合式函数（Composables）', where: 'src/composables/index.js（7 个函数）', done: true },
  { chapter: '自定义指令', where: 'directives/highlight.js、directives/ripple.js', done: true },
  { chapter: '插件', where: 'plugins/notify.js（provide + globalProperties + 注册组件）', done: true },
  { chapter: '状态管理（Pinia）', where: 'stores/market.js、stores/user.js', done: true },
  { chapter: '路由（vue-router）', where: 'router/index.js（守卫、懒加载、动态参数）', done: true },
  { chapter: '过渡与动画（Transition）', where: 'App.vue、ItemGrid.vue、ToastHost.vue', done: true },
]

const doneCount = computed(() => knowledge.filter((k) => k.done).length)

/** 项目目录结构（静态字符串，用 <pre> 展示） */
const tree = `nanhua-yitao/
├─ index.html
├─ vite.config.js
├─ package.json
└─ src/
   ├─ main.js                 # 应用入口：插件、全局组件、全局指令
   ├─ App.vue                 # 根组件：布局 + 路由出口 + 路由过渡
   ├─ assets/styles/main.css  # 设计系统（CSS 变量 / 深色模式）
   ├─ router/index.js         # 路由表 + 全局守卫 + 懒加载
   ├─ stores/
   │  ├─ market.js            # 商品 / 筛选 / 收藏 / 评论（Pinia）
   │  └─ user.js              # 登录状态 + 主题 + 搜索历史
   ├─ composables/index.js    # 7 个组合式函数（防抖、本地存储、相对时间…）
   ├─ directives/
   │  ├─ highlight.js         # v-highlight 关键词高亮
   │  └─ ripple.js            # v-ripple 点击水波纹
   ├─ plugins/notify.js       # 自定义插件：全局轻提示
   ├─ data/
   │  ├─ items.js             # 28 条模拟商品 + 评论 + 轮播配置
   │  └─ categories.js        # 分类字典 + 渐变封面生成
   ├─ components/
   │  ├─ layout/              # AppHeader / AppFooter / ThemeToggle
   │  ├─ common/              # BaseModal / EmptyState / SkeletonCard / StarRating / StatBadge / ToastHost / BackToTop
   │  ├─ market/              # ItemCard / ItemGrid / SearchBar / CategoryFilter / SortBar / PaginationBar / CommentList / CommentForm / FavoriteButton
   │  ├─ home/                # BannerCarousel / FeaturePanel / PlatformTimeline
   │  └─ lab/                 # 10 个知识点演示组件 + 2 个辅助子组件
   └─ views/                  # 8 个页面：首页 / 市场 / 详情 / 发布 / 收藏 / 实验室 / 关于 / 404`

const faqs = [
  {
    q: '数据会保存吗？',
    a: '会。收藏、发布的商品、评论和主题偏好都写在浏览器 localStorage 里，刷新或关闭浏览器后仍在；换设备或清除浏览器数据就会丢失（因为本项目没有后端）。',
  },
  {
    q: '为什么用 Hash 路由（地址里有 #）？',
    a: '本项目部署在 GitHub Pages 这类静态托管上，Hash 模式刷新页面不会 404，也不需要服务端重写规则，对纯前端项目最省事。',
  },
  {
    q: '页面里的商品是真的吗？',
    a: '不是。所有商品、卖家、评论都是 data/items.js 里生成的模拟数据，仅用于课程演示，不涉及真实交易。',
  },
  {
    q: '怎么快速体验全部知识点？',
    a: '进入「Vue 实验室」，左侧目录的 10 个演示覆盖了官方教程的全部章节，每个演示都能直接操作。',
  },
]

const openFaq = ref(0)
function toggleFaq(i) {
  openFaq.value = openFaq.value === i ? -1 : i
}
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <header class="about-head panel">
        <div>
          <h1>{{ siteInfo.name }} · 关于本站</h1>
          <p class="muted">
            这是《{{ siteInfo.course }}》课程的实验作品：一个用 Vue 3 实现的纯前端校园二手交易平台，
            所有交互逻辑都在浏览器里完成。
          </p>
        </div>
        <dl class="info">
          <div><dt>作者</dt><dd>{{ siteInfo.author }}</dd></div>
          <div><dt>学号</dt><dd>{{ siteInfo.studentId }}</dd></div>
          <div><dt>班级</dt><dd>{{ siteInfo.className }}</dd></div>
          <div><dt>学院</dt><dd>{{ siteInfo.college }}</dd></div>
          <div><dt>版本</dt><dd>v{{ siteInfo.version }}</dd></div>
        </dl>
      </header>

      <!-- 技术栈 -->
      <section class="panel">
        <h3 class="section-title">技术栈</h3>
        <div class="stack">
          <div v-for="s in stack" :key="s.name" class="stack__item">
            <span class="stack__icon">{{ s.icon }}</span>
            <div>
              <strong>{{ s.name }}</strong>
              <p class="small muted">{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 知识点对照表 -->
      <section class="panel" id="knowledge">
        <div class="row-between wrap" style="margin-bottom: 12px">
          <h3 class="section-title" style="margin: 0">知识点覆盖对照表</h3>
          <span class="tag tag-brand">已覆盖 {{ doneCount }} / {{ knowledge.length }} 项</span>
        </div>
        <p class="small muted">
          下表把 <a href="https://cn.vuejs.org/tutorial/" target="_blank" rel="noreferrer">Vue 官方教程</a>
          的章节逐一对应到本项目的实现文件，方便查阅和答辩。
        </p>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 46px">#</th>
                <th>教程章节 / 知识点</th>
                <th>本项目实现位置</th>
                <th style="width: 104px">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(k, i) in knowledge" :key="k.chapter">
                <td class="muted">{{ i + 1 }}</td>
                <td><strong>{{ k.chapter }}</strong></td>
                <td class="small muted">{{ k.where }}</td>
                <td><span class="tag tag-brand">✓ 已实现</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 目录结构 -->
      <section class="panel">
        <h3 class="section-title">项目目录结构</h3>
        <pre class="tree">{{ tree }}</pre>
      </section>

      <!-- 常见问题：手风琴交互 -->
      <section class="panel" id="faq">
        <h3 class="section-title">常见问题</h3>
        <div class="faq">
          <div v-for="(f, i) in faqs" :key="f.q" class="faq__item" :class="{ 'is-open': openFaq === i }">
            <button class="faq__q" @click="toggleFaq(i)">
              <span>{{ f.q }}</span>
              <em>{{ openFaq === i ? '−' : '+' }}</em>
            </button>
            <p v-show="openFaq === i" class="faq__a small muted">{{ f.a }}</p>
          </div>
        </div>
      </section>

      <!-- 交易守则：锚点跳转的目标 -->
      <section class="panel" id="rules">
        <h3 class="section-title">校园闲置交易守则</h3>
        <ol class="rules">
          <li v-for="(r, i) in [
            '仅发布本人合法持有的闲置物品，禁止代购、转卖与违禁品。',
            '优先选择校内公共场所当面交易，贵重物品务必现场验货。',
            '如实描述商品成色与瑕疵，禁止使用他人图片与虚假描述。',
            '交易完成后请及时评价，信用分低于 80 分将被限制发布。',
            '遇到纠纷先沟通，必要时联系平台管理员协助处理。',
          ]" :key="i">
            {{ r }}
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.about-head h1 {
  font-size: 23px;
  margin-bottom: 8px;
}

.about-head p {
  margin: 0;
  max-width: 560px;
  font-size: 13.5px;
}

.info {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 10px 20px;
  margin: 0;
}

.info div {
  display: flex;
  gap: 8px;
  font-size: 13.5px;
}

.info dt {
  color: var(--text-muted);
}

.info dd {
  margin: 0;
  font-weight: 700;
}

section.panel {
  margin-bottom: 18px;
}

.stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 14px;
}

.stack__item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius);
  background: var(--bg-sunken);
}

.stack__icon {
  font-size: 21px;
}

.stack__item p {
  margin: 2px 0 0;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
}

.table th,
.table td {
  text-align: left;
  padding: 9px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.table th {
  font-size: 12.5px;
  color: var(--text-muted);
  background: var(--bg-sunken);
  position: sticky;
  top: 0;
}

.table tbody tr:hover {
  background: var(--bg-sunken);
}

.tree {
  background: var(--bg-sunken);
  border-radius: var(--radius);
  padding: 16px;
  font-size: 12.5px;
  line-height: 1.75;
  overflow: auto;
  max-height: 460px;
  margin: 0;
  font-family: ui-monospace, Consolas, monospace;
}

.faq {
  display: grid;
  gap: 8px;
}

.faq__item {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color 0.2s;
}

.faq__item.is-open {
  border-color: var(--brand);
}

.faq__q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 15px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
}

.faq__q em {
  font-style: normal;
  font-size: 18px;
  color: var(--brand-strong);
}

.faq__a {
  margin: 0;
  padding: 0 15px 14px;
  line-height: 1.8;
}

.rules {
  display: grid;
  gap: 10px;
  counter-reset: rule;
  padding: 0;
}

.rules li {
  position: relative;
  padding-left: 42px;
  font-size: 13.5px;
  line-height: 1.75;
  counter-increment: rule;
}

.rules li::before {
  content: counter(rule);
  position: absolute;
  left: 0;
  top: 2px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--accent));
}

a {
  color: var(--brand-strong);
}
</style>