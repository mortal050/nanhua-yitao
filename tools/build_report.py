"""按《实验报告模板(2).docx》生成「南华易淘」实验报告。

保留模板封面（南华大学 / 计算机学院 / 实验报告 / 课程名称 / 姓名 / 学号 / 专业）与
Heading 1 样式，正文内容与截图由本脚本写入。
"""
import os
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

TEMPLATE = r"D:\cxdownload\实验报告模板(2).docx"
WS = r"C:\Users\29590\Documents\deepseek-harness\default-workspace"
SHOTS = os.path.join(WS, "screenshots")
OUT = os.path.join(WS, "实验报告-南华易淘-吴星雨-20244081131.docx")

BODY_FONT = "宋体"
BODY_ASCII = "Times New Roman"
CODE_FONT = "Consolas"


# --------------------------------------------------------------------------- #
# 工具函数
# --------------------------------------------------------------------------- #
def set_font(run, ascii_font=BODY_ASCII, east_font=BODY_FONT, size=10.5, bold=None, color=None):
    run.font.name = ascii_font
    run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = color
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:eastAsia"), east_font)
    rfonts.set(qn("w:ascii"), ascii_font)
    rfonts.set(qn("w:hAnsi"), ascii_font)


def shade(paragraph, fill="F4F6F7"):
    ppr = paragraph._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill)
    ppr.append(shd)


def para(doc, text="", size=10.5, bold=False, indent=0, space_after=6, align=None,
         east=BODY_FONT, ascii_font=BODY_ASCII, color=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.line_spacing = 1.4
    if indent:
        p.paragraph_format.left_indent = Cm(indent)
    if align:
        p.alignment = align
    run = p.add_run(text)
    set_font(run, ascii_font=ascii_font, east_font=east, size=size, bold=bold, color=color)
    return p


def bullet(doc, text, size=10.5, marker="•", indent=0.6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.4
    p.paragraph_format.left_indent = Cm(indent)
    p.paragraph_format.first_line_indent = Cm(-0.6)
    run = p.add_run(f"{marker} {text}")
    set_font(run, size=size)
    return p


def code(doc, snippet, size=8.5):
    """代码块：等宽字体 + 浅灰底色 + 左缩进"""
    lines = snippet.strip("\n").split("\n")
    for i, line in enumerate(lines):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.left_indent = Cm(0.4)
        run = p.add_run(line if line else " ")
        set_font(run, ascii_font=CODE_FONT, east_font=CODE_FONT, size=size, color=RGBColor(0x1F, 0x2B, 0x33))
        shade(p, "F2F4F5" if i % 2 == 0 else "EDF1F3")
    # 代码块后留一点空隙
    doc.paragraphs[-1].paragraph_format.space_after = Pt(8)


def image(doc, filename, caption, width_cm=14.5):
    path = os.path.join(SHOTS, filename)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(path, width=Cm(width_cm))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)
    run = cap.add_run(caption)
    set_font(run, size=9, color=RGBColor(0x5A, 0x6A, 0x72))


def table_borders(t):
    """模板里没有内置表格样式，这里手工加一组细边框"""
    tbl_pr = t._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "6")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "9AA5AA")
        borders.append(el)
    tbl_pr.append(borders)


def table(doc, headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    table_borders(t)
    for i, h in enumerate(headers):
        cell = t.rows[0].cells[i]
        cell.text = ""
        run = cell.paragraphs[0].add_run(h)
        set_font(run, size=9.5, bold=True, east_font="黑体")
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(val))
            set_font(run, size=9)
    if widths:
        for r in t.rows:
            for i, w in enumerate(widths):
                r.cells[i].width = Cm(w)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return t


def section(doc, title):
    h = doc.add_heading(title, level=1)
    for run in h.runs:
        set_font(run, east_font="黑体", ascii_font="Times New Roman", size=14, bold=True)
    return h


# --------------------------------------------------------------------------- #
# 1. 载入模板，填写封面
# --------------------------------------------------------------------------- #
doc = Document(TEMPLATE)

cover_map = {
    "课程名称": "课程名称              Web 全栈开发             ",
    "姓    名": "姓    名                    吴星雨                  ",
    "学    号": "学    号                 20244081131                ",
    "专    业": "专    业            计算机类（24 数信 01 班）        ",
}

for p in doc.paragraphs[:19]:
    text = p.text.strip()
    for key, new_text in cover_map.items():
        if text.startswith(key.replace(" ", "")) or text.startswith(key):
            for run in p.runs[1:]:
                run.text = ""
            if p.runs:
                p.runs[0].text = new_text
                set_font(p.runs[0], east_font="楷体_GB2312", ascii_font="Times New Roman", size=14, bold=True)
            break

# 学期：当前为 2026—2027 学年第 1 学期
for p in doc.paragraphs[:19]:
    if "学年度" in p.text and "学期" in p.text:
        for run in p.runs:
            run.text = ""
        p.runs[0].text = "（ 2026 ~ 2027 学年度   第 1 学期 ）"
        set_font(p.runs[0], east_font="宋体", ascii_font="Times New Roman", size=14)
        break

# 删除模板中「一、实验目的」及之后的示例内容，正文由脚本重新写入
body = doc.element.body
start = None
for p in doc.paragraphs:
    if p.text.strip().startswith("一、实验目的"):
        start = p
        break
if start is None:
    raise SystemExit("未在模板中找到『一、实验目的』标题")

started = False
for child in list(body):
    if child is start._p:
        started = True
        continue
    if started and child.tag.endswith("}p"):
        body.remove(child)

# 删除模板里的第一个"一、实验目的"标题（稍后由 section() 重新添加，保证顺序一致）
body.remove(start._p)

# --------------------------------------------------------------------------- #
# 2. 正文内容
# --------------------------------------------------------------------------- #
section(doc, "一、实验目的")
para(doc, "本次实验以「南华易淘 · 校园二手交易平台」为题，使用 Vue 3 完成一个纯前端的完整网站，"
          "并通过 GitHub Pages 部署到公网。具体目标如下：")
for i, text in enumerate([
    "掌握 Vue 3 的工程化开发方式：使用 Vite 搭建项目，理解单文件组件（SFC）与 <script setup> 组合式 API 的组织方式，"
    "理解「一个组件 = 模板 + 逻辑 + 样式」的封装思想。",
    "掌握 Vue 的响应式系统：ref 与 reactive 的区别与使用场景、computed 的缓存机制与可写计算属性、"
    "watch 与 watchEffect 的差异（含 deep / immediate / 手动停止侦听）。",
    "掌握模板语法与内置指令：插值、v-bind（含动态参数与对象语法）、v-on（含 6 种事件修饰符）、"
    "v-if / v-else-if / v-else / v-show、v-for（理解 key 的作用）、v-model（含 .number / .trim / .lazy 修饰符与各种表单控件）。",
    "掌握组件化开发的完整通信方式：props 声明与校验、emits 自定义事件、组件上的 v-model（defineModel）、"
    "透传 attribute（$attrs / inheritAttrs）、插槽（默认插槽 / 具名插槽 / 作用域插槽 / 动态插槽名）、依赖注入 provide / inject。",
    "掌握 vue-router 4 的使用：动态路由参数、命名路由、编程式导航、路由懒加载、全局前置守卫，"
    "以及筛选条件与地址栏 query 的双向同步。",
    "掌握 Pinia 状态管理（Setup Store 写法），并能结合 watch 与 localStorage 实现纯前端数据持久化。",
    "掌握三种复用机制：组合式函数（Composable）、自定义指令（v-highlight / v-ripple）、插件（全局轻提示）。",
    "完成不少于 3 个页面、15 个以上单文件组件的项目，并部署到公网可访问的地址，能够完整讲清代码逻辑。",
]):
    bullet(doc, text, marker=f"{i + 1}.", indent=0.85)

section(doc, "二、实验环境")
for text in [
    "操作系统：Windows 11（10.0.26100）",
    "运行时环境：Node.js v24.21.0、npm 11.19.0",
    "开发工具：Visual Studio Code、Git 2.56（Windows）",
    "前端框架：Vue 3.5.44（组合式 API + <script setup> 单文件组件）",
    "构建工具：Vite 6.4.5、@vitejs/plugin-vue 5.2",
    "路由与状态管理：Vue Router 4.5（Hash 模式）、Pinia 2.3",
    "样式方案：原生 CSS，使用 CSS 自定义属性（变量）实现设计系统与深色模式",
    "数据持久化：浏览器 localStorage（无后端，纯前端项目）",
    "调试与验收工具：Microsoft Edge / Chromium，Playwright 无头浏览器（自动化走查 20 个场景并截图）",
    "部署环境：GitHub 仓库 + GitHub Pages（gh-pages 分支托管构建产物）",
    "项目目录：nanhua-yitao/（源码）；dist/（构建产物）",
    "常用命令：npm install（安装依赖）、npm run dev（开发服务器 5173）、npm run build（生产构建）、npm run preview（预览 4173）",
]:
    bullet(doc, text)

section(doc, "三、实验步骤")

steps = [
    ("1. 选题与需求分析",
     "确定「校园二手交易平台」主题，梳理出首页、二手市场、商品详情、发布闲置、我的收藏、Vue 知识实验室、关于本站、404 共 8 个页面；"
     "抽象出商品（标题、分类、现价、原价、成色、交易地点、卖家、浏览量、标签、描述）、评论、分类三个数据模型，"
     "并明确「纯前端 + localStorage 持久化」的技术边界，不使用后端接口。"),
    ("2. 搭建工程骨架",
     "手工创建 package.json、vite.config.js、index.html 与 src 目录，安装 vue、vue-router、pinia 与 vite、@vitejs/plugin-vue；"
     "在 vite.config.js 中配置 @ 别名指向 src，并把 base 设为可被环境变量 BASE_PATH 覆盖，以适配 GitHub Pages 的项目子路径。"),
    ("3. 设计样式系统与深色模式",
     "在 assets/styles/main.css 中以 CSS 自定义属性定义品牌色、背景色、文字色、圆角、阴影等变量，"
     "通过 <html data-theme=\"dark\"> 覆盖变量实现深色模式；同时提供 .container/.panel/.btn/.tag/.field 等公共类与响应式断点。"),
    ("4. 编写数据层",
     "data/categories.js 定义 8 个分类字典（含颜色与图标）与分类渐变色封面生成函数；"
     "data/items.js 用「元组数组 + 工厂函数」生成 28 条商品数据、预置评论、轮播与平台特色配置，保证数据一致可复现。"),
    ("5. 编写状态管理层（Pinia）",
     "stores/market.js 用 Setup Store 写法管理商品、收藏、评论、筛选条件与分页，"
     "getters 负责「关键词 + 分类 + 价格区间 + 是否可议价」的链式筛选与 4 种排序，actions 负责收藏、发布、评论、浏览量；"
     "再用 watch 把收藏、已发布商品、评论、筛选条件同步到 localStorage，并处理页码越界、筛选变化自动回到第 1 页等细节。"
     "stores/user.js 管理模拟登录、主题偏好与搜索历史。"),
    ("6. 编写复用层",
     "composables/index.js 提供 7 个组合式函数：useLocalStorage、useDebouncedRef（customRef 实现防抖）、"
     "useDebounceFn、useThrottleFn、useRelativeTime、useCurrency、useScrollBottom / useWindowSize（含 onUnmounted 清理）；"
     "directives/highlight.js 与 ripple.js 实现关键词高亮与点击水波纹两个自定义指令；"
     "plugins/notify.js 实现一个插件，同时演示 app.provide、app.config.globalProperties 与插件内注册全局组件三种能力。"),
    ("7. 编写组件层（43 个单文件组件）",
     "按职责分为：布局组件 3 个（AppHeader / AppFooter / ThemeToggle）、通用组件 7 个（BaseModal / EmptyState / SkeletonCard / "
     "StarRating / StatBadge / ToastHost / BackToTop）、业务组件 9 个（ItemCard / ItemGrid / SearchBar / CategoryFilter / SortBar / "
     "PaginationBar / CommentList / CommentForm / FavoriteButton）、首页组件 3 个、实验室演示组件 12 个、页面组件 8 个、根组件 App.vue。"),
    ("8. 组装页面与路由",
     "router/index.js 配置 8 条路由（含动态路由 /item/:id 与通配 404），除首页外全部使用 () => import() 懒加载；"
     "在全局前置守卫中统一设置文档标题，并对 /publish 做「需要登录」的拦截演示；"
     "App.vue 用 <RouterView> + <Transition> 组装整体布局与路由过渡动画。"),
    ("9. 构建与自动化验收",
     "执行 npm run build 完成生产构建（构建产物按路由分包）；"
     "编写 tools/screenshot.mjs，用 Playwright 依次访问各页面并模拟真实操作（登录、搜索、排序、收藏、发布商品、发表评价、"
     "切换实验室标签、卸载演示组件、切换深色模式、移动端视图等），收集控制台错误并自动保存 25 张截图。"),
    ("10. 部署上线",
     "编写 tools/deploy-gh.mjs：读取 GITHUB_TOKEN 后自动创建仓库、推送源码到 main 分支、"
     "以 BASE_PATH=/仓库名/ 构建并把 dist 推送到 gh-pages 分支，最后调用 GitHub API 开启 Pages，输出公网地址。"),
]
for title, body_text in steps:
    para(doc, title, bold=True, size=11, space_after=3, east="黑体")
    para(doc, body_text, indent=0.5, space_after=10)

section(doc, "四、代码示例")
para(doc, "下面给出本项目中 8 段关键代码（均摘自实际文件），并在每段代码后说明其对应的知识点。")

code_items = [
    ("1）应用入口：创建应用、安装插件、注册全局指令与全局组件（src/main.js）",
     """import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import notifyPlugin from './plugins/notify'
import highlight from './directives/highlight'
import './assets/styles/main.css'

const app = createApp(App)          // 创建应用实例
app.use(createPinia())              // 状态管理
app.use(router)                     // 路由
app.use(notifyPlugin)               // 自定义插件：全局 $notify
app.directive('highlight', highlight)   // 全局注册自定义指令
app.component('StatBadge', StatBadge)   // 全局注册组件
app.config.errorHandler = (err, i, info) => console.error('[全局错误]', info, err)
app.mount('#app')                   // 挂载到 #app""",
     "说明：对应教程《创建一个应用》《插件》《自定义指令》《组件注册》。全局注册的 StatBadge 可以在任何组件模板中直接使用；"
     "插件同时提供了 inject 注入与 this.$notify 两种调用方式。"),
    ("2）Pinia Setup Store：筛选、排序与分页（src/stores/market.js 节选）",
     """export const useMarketStore = defineStore('market', () => {
  const items = ref([...load('ny-published', []), ...seedItems])
  const keyword = ref(''); const category = ref('all')
  const priceRange = ref('all'); const sortBy = ref('newest')
  const page = ref(1); const pageSize = ref(8)

  // getter：多个筛选条件串联，依赖不变时复用缓存结果
  const filteredItems = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    const inRange = PRICE_RANGES[priceRange.value] || PRICE_RANGES.all
    const list = items.value.filter((it) => {
      const hitKeyword = !kw || it.title.toLowerCase().includes(kw)
        || it.tags.some((t) => t.toLowerCase().includes(kw))
      const hitCategory = category.value === 'all' || it.category === category.value
      return hitKeyword && hitCategory && inRange(it.price)
    })
    const sorters = { newest: (a, b) => b.publishedAt - a.publishedAt,
                      priceAsc: (a, b) => a.price - b.price, hot: (a, b) => b.views - a.views }
    return [...list].sort(sorters[sortBy.value] || sorters.newest)
  })

  const pagedItems = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return filteredItems.value.slice(start, start + pageSize.value)
  })

  // 副作用：把收藏写回 localStorage（数据持久化）
  watch(favorites, (v) => localStorage.setItem('ny-favorites', JSON.stringify(v)), { deep: true })
  // 筛选条件变化时自动回到第 1 页
  watch([keyword, category, priceRange, sortBy], () => { page.value = 1 })
  return { items, keyword, category, filteredItems, pagedItems, toggleFavorite }
})""",
     "说明：Pinia 的 Setup Store 与组合式函数的写法完全一致 —— ref 即 state、computed 即 getters、函数即 actions。"
     "筛选与排序全部写在 computed 里，模板只负责渲染，充分体现「数据驱动视图」。"),
    ("3）可写计算属性与侦听器（src/components/lab/ComputedWatchDemo.vue 节选）",
     """const firstName = ref('星'); const lastName = ref('雨')
// computed 的 getter / setter：可读也可写
const fullName = computed({
  get: () => `${lastName.value}${firstName.value}`,
  set(val) { lastName.value = val.slice(0, 1); firstName.value = val.slice(1) },
})

let calcTimes = 0
const total = computed(() => { calcTimes++; return price.value * qty.value })  // 有缓存

// 深度侦听对象
watch(form, (val) => log('表单变化：' + val.title), { deep: true })
// 手动停止侦听：watch 返回一个停止函数
const stop = watch(c, (v) => log('计数器 = ' + v))
stop()""",
     "说明：computed 只有依赖变化时才重新求值（页面上的「求值次数」可以直观验证缓存特性）；"
     "watch 适合「数据变化后做某件事」，本例用日志面板把触发过程可视化。"),
    ("4）用 defineModel 实现组件上的 v-model（src/components/common/BaseModal.vue 节选）",
     """const visible = defineModel({ type: Boolean, default: false })   // 父组件写 v-model="showOrder"
const props = defineProps({ title: { type: String, default: '提示' } })
const emit = defineEmits(['open', 'close', 'confirm'])

watch(visible, (val) => { document.body.style.overflow = val ? 'hidden' : '' })""",
     """<Teleport to="body">
  <Transition name="modal">
    <div v-if="visible" class="mask" @click.self="visible = false">
      <div class="modal">
        <header><slot name="header"><h3>{{ title }}</h3></slot></header>
        <div class="modal__body"><slot /></div>                     <!-- 默认插槽 -->
        <footer v-if="$slots.footer">                               <!-- 用 $slots 判断是否传了插槽 -->
          <slot name="footer" :close="() => (visible = false)" />    <!-- 作用域插槽 -->
        </footer>
      </div>
    </div>
  </Transition>
</Teleport>""",
     "说明：一个弹窗组件同时演示了 defineModel（组件 v-model）、Teleport（传送节点）、Transition（过渡动画）、"
     "具名插槽 / 默认插槽 / 作用域插槽与 $slots 判断，是组件封装能力的集中体现。"),
    ("5）自定义指令：关键词高亮（src/directives/highlight.js 节选）",
     """export default {
  mounted(el, binding) { render(el, binding) },     // 挂载后执行
  updated(el, binding) { render(el, binding) },     // 依赖更新后重新执行
  unmounted(el) { el.innerHTML = el.textContent },
}

function render(el, binding) {
  const keyword = String(binding.value || '').trim()
  const text = el.textContent
  if (!keyword) { el.innerHTML = escapeHtml(text); return }
  // 把关键词替换为 <mark>，并做 HTML 转义，避免 XSS
  el.innerHTML = escapeHtml(text).replace(new RegExp(`(${escapeRegExp(keyword)})`, 'gi'),
    '<mark class="ny-hl">$1</mark>')
}""",
     "说明：指令在 main.js 中通过 app.directive('highlight', highlight) 全局注册，"
     "用法为 v-highlight=\"market.keyword\"，被搜索关键词会在商品标题中高亮显示。"),
    ("6）路由配置与全局守卫（src/router/index.js 节选）",
     """const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  // 懒加载：只有访问该路由时才下载对应 chunk
  { path: '/market', name: 'market', component: () => import('@/views/MarketView.vue') },
  // 动态路由参数 + props: true，组件里直接用 props 接收 id
  { path: '/item/:id', name: 'item-detail', component: () => import('@/views/ItemDetailView.vue'), props: true },
  { path: '/publish', name: 'publish', component: () => import('@/views/PublishView.vue'),
    meta: { requiresLogin: true } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
]

const router = createRouter({ history: createWebHashHistory(), routes, scrollBehavior() { return { top: 0 } } })

router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 南华易淘` : '南华易淘'
  if (to.meta.requiresLogin && !localStorage.getItem('ny-user')) {
    return { name: 'home', query: { redirect: to.fullPath, needLogin: '1' } }   // 拦截并跳转
  }
  return true
})""",
     "说明：本项目的商品详情页用 props: true 接收路由参数，市场页则把筛选条件写回地址栏 query，"
     "实现「刷新 / 分享链接后筛选状态不丢」。"),
    ("7）异步组件 + Suspense + 模板引用（src/components/lab/AsyncRefDemo.vue 节选）",
     """// 方式一：直接传 loader
const AsyncChart = defineAsyncComponent(() => import('@/components/lab/ChartPanel.vue'))
// 方式二：配置加载中 / 出错 / 超时的兜底组件
const AsyncChartWithOptions = defineAsyncComponent({
  loader: () => import('@/components/lab/ChartPanel.vue'),
  loadingComponent: SkeletonCard, delay: 150, timeout: 8000,
})

const inputEl = ref(null)                  // 模板引用
const boxEl = useTemplateRef('boxEl')      // Vue 3.5 的新写法
onMounted(() => inputEl.value?.focus())    // DOM 挂载完成后才拿得到元素""",
     """<Suspense @resolve="status = '加载完成'" @pending="status = '加载中…'">
  <template #default><component :is="activeAsync" /></template>
  <template #fallback><SkeletonCard :count="2" /></template>
</Suspense>""",
     "说明：ChartPanel.vue 的 setup 中使用了顶层 await 模拟接口请求，必须由 <Suspense> 包裹才能正常显示；"
     "等待期间展示的就是 fallback 里的骨架屏。"),
    ("8）作用域插槽：把数据交给使用者决定怎么渲染（src/components/market/ItemGrid.vue 节选）",
     """<div class="cards">
  <ItemCard v-for="item in props.items" :key="item.id" :item="item"
            :favorite="favoriteIds.includes(item.id)"
            @toggle-favorite="emit('toggle-favorite', $event)"
            @open="emit('open', $event)" />
</div>

<!-- 作用域插槽：把统计结果回传给父组件 -->
<slot name="summary" :count="props.items.length" :mode="mode" />""",
     """<!-- MarketView.vue 中的使用方式 -->
<ItemGrid :items="market.pagedItems" :mode="market.viewMode" @open="openItem">
  <template #summary="{ count, mode }">
    <p class="small muted">本页显示 {{ count }} 件 · 当前为{{ mode === 'grid' ? '网格' : '列表' }}视图</p>
  </template>
</ItemGrid>""",
     "说明：子组件只负责「有哪些数据」，父组件决定「怎么显示」，这是作用域插槽最典型的使用场景；"
     "实验室的 SlotDemo.vue 还演示了动态插槽名与插槽后备内容。"),
]
for entry in code_items:
    # 每个条目为 (标题, 代码片段[, 追加代码片段], 说明)
    title, snippets, note = entry[0], entry[1:-1], entry[-1]
    para(doc, title, bold=True, size=10.5, space_after=3, east="黑体")
    for snippet in snippets:
        code(doc, snippet)
    para(doc, note, indent=0.5, space_after=10)

section(doc, "五、实验结果")

para(doc, "项目已在本地完成构建与自动化验收：npm run build 构建成功，产物按路由分包（首页 164.6 kB / gzip 65.3 kB，"
          "实验室 41.8 kB / gzip 15.6 kB 等）；Playwright 脚本自动走查 20 个场景、保存 25 张截图，控制台错误与警告均为 0 个。"
          "下面按页面顺序展示运行效果。")

image(doc, "01-home.png", "图 1  首页：欢迎语（按时段变化）、轮播 Banner、数据看板、分类入口、热门推荐")
para(doc, "首页由 BannerCarousel、StatBadge（全局注册组件）、FeaturePanel、ItemGrid 等组件组合而成，"
          "所有数字都来自 Pinia 的 computed 统计，新增一件商品后数字会自动变化。", indent=0.5, space_after=8)

image(doc, "03-market.png", "图 2  二手市场：分类筛选、排序工具条、商品卡片、分页")
para(doc, "市场页集中体现了组件间通过 Pinia 共享状态：SearchBar 写入 keyword、CategoryFilter 写入 category、"
          "SortBar 写入 sortBy / priceRange，ItemGrid 只依赖 store 的 pagedItems 渲染，"
          "筛选条件同时同步到地址栏 query（#/market?q=考研&category=exam）。", indent=0.5, space_after=8)

image(doc, "04-market-search.png", "图 3  搜索「考研」：防抖触发筛选 + 关键词高亮（自定义指令 v-highlight）")

image(doc, "06-detail.png", "图 4  商品详情：动态路由 /item/:id、折扣计算、卖家信息、收藏与下单入口")
para(doc, "详情页通过 props: true 接收路由参数；同一路由切换商品时组件实例会被复用，"
          "因此用 watch 监听 id 变化来重新累计浏览量，这是动态路由中很容易被忽略的细节。", indent=0.5, space_after=8)

image(doc, "08-detail-comment-done.png", "图 5  发表交易评价：表单校验（v-model + computed）与评论列表实时更新")

image(doc, "10-publish-form.png", "图 6  发布闲置：六类表单控件 + 完成度进度条 + 右侧实时预览")
para(doc, "右侧「实时预览」没有写任何额外逻辑，它直接读取同一份 form 数据，"
          "直观展示了「数据驱动视图」与单向数据流：数据变，两处 UI 一起变。", indent=0.5, space_after=8)

image(doc, "11-publish-success.png", "图 7  发布成功弹窗（BaseModal：defineModel + Teleport + 插槽）")

image(doc, "13-favorites.png", "图 8  我的收藏：价值统计、清空二次确认、收藏备注（useLocalStorage 组合式函数）")

image(doc, "14-lab-reactivity.png", "图 9  Vue 知识实验室：响应式基础与模板语法演示")
para(doc, "实验室共 10 个交互演示，覆盖 Vue 官方教程全部章节；"
          "左侧目录切换使用动态组件 <component :is> + <KeepAlive>，切换回来时组件状态（计数、日志）依然保留。", indent=0.5, space_after=8)

image(doc, "15-lab-computed.png", "图 10  计算属性：getter/setter、缓存（求值次数）、watch 深度侦听日志")

image(doc, "16-lab-slot.png", "图 11  插槽：默认插槽 / 具名插槽 / 后备内容 / 作用域插槽（表格由父组件渲染）")

image(doc, "17-lab-async-loading.png", "图 12  异步组件加载中：Suspense 的 fallback 骨架屏（ChartPanel 内有顶层 await）")
image(doc, "18-lab-async-done.png", "图 13  异步组件加载完成：0.9 秒后渲染出分类占比图")

image(doc, "19-lab-unmounted.png", "图 14  卸载演示组件：触发 onBeforeUnmount / onUnmounted 并清理定时器")

image(doc, "20-about.png", "图 15  关于本站：技术栈、知识点对照表、项目目录结构、常见问题")

image(doc, "22-dark-mode.png", "图 16  深色模式：通过切换 <html data-theme> 覆盖 CSS 变量实现，偏好写入 localStorage")

image(doc, "23-notfound.png", "图 17  404 页面：通配路由 /:pathMatch(.*)* 的落点")

image(doc, "24-mobile-home.png", "图 18  移动端（390×844）自适应：汉堡菜单、单列布局")

para(doc, "各页面与组件清单如下：", indent=0.5, space_after=6)
table(doc,
      ["页面", "路由", "主要组件", "涉及知识点"],
      [
          ["首页", "#/", "BannerCarousel、FeaturePanel、StatBadge、ItemGrid", "生命周期、异步组件、provide/inject、computed"],
          ["二手市场", "#/market", "SearchBar、CategoryFilter、SortBar、ItemGrid、PaginationBar、SkeletonCard、EmptyState", "组件 v-model、防抖、作用域插槽、列表渲染、过渡"],
          ["商品详情", "#/item/:id", "ItemCard、FavoriteButton、CommentList、CommentForm、BaseModal、StarRating", "动态路由、watch、props/emits、插槽、Teleport"],
          ["发布闲置", "#/publish", "StarRating、BaseModal", "v-model 全家桶与修饰符、表单校验、路由守卫"],
          ["我的收藏", "#/favorites", "ItemGrid、EmptyState、BaseModal", "getters、watch、组合式函数、二次确认"],
          ["知识实验室", "#/lab", "10 个演示组件 + CounterPanel、ChartPanel", "官方教程全部章节"],
          ["关于本站", "#/about", "—", "v-for 渲染配置、锚点跳转、v-show 手风琴"],
          ["404", "#/任意路径", "—", "通配路由、编程式导航"],
      ],
      widths=[2.2, 2.0, 5.6, 4.7])

para(doc, "自动化验收结果：", indent=0.5, space_after=6)
table(doc,
      ["验收项", "结果"],
      [
          ["生产构建", "成功，34 个模块，按路由分包，首页 gzip 后 65.3 kB"],
          ["单文件组件数量", "43 个（页面 8 + 业务/通用组件 34 + 根组件 1）"],
          ["自动化场景", "20 个（登录、搜索、排序、视图切换、收藏、发布、评价、下单、切换实验室、卸载组件、深色模式、移动端等）"],
          ["截图数量", "25 张（见本报告配图）"],
          ["控制台错误 / 警告", "0 个"],
          ["部署", "源码推送 GitHub main 分支，构建产物推送 gh-pages 分支并开启 GitHub Pages"],
      ],
      widths=[3.6, 10.9])

section(doc, "六、问题与解决")

problems = [
    ("问题 1：在 onUpdated 里写响应式数据导致页面卡死，控制台报 Maximum call stack size exceeded。",
     "原因：onUpdated 钩子在「DOM 更新完成后」触发，而我在钩子里往被模板渲染的数组里 push 日志，"
     "这次写入又触发了一次更新，于是形成「更新 → 记录日志 → 再更新」的无限递归。",
     "解决：给日志加一层「值是否真的变化」的判断（比较上一次记录的值），只在数据变化时写日志；"
     "同时把每次更新都要输出的调试信息改成 console.log（不会触发重新渲染）。"
     "这个问题让我真正理解了响应式副作用必须收敛，也理解了 onBeforeUpdate / onUpdated 的触发时机。"),
    ("问题 2：发布表单在自动化测试里一直提示「还有 1 项待完善」，按钮始终禁用。",
     "原因：联系方式输入框用了 v-model.lazy，它只在 change（失焦）事件时才同步数据，"
     "自动填表只触发了 input 事件，所以表单里的值一直是空的。",
     "解决：在自动化脚本中补一次失焦（按下 Tab）；同时也确认这正是 .lazy 的预期行为，"
     "在表单校验、双向绑定时机的问题上有了更准确的认识。"),
    ("问题 3：给子组件同时写 defineProps 的 count 和 defineModel('count') 会重复声明。",
     "原因：v-model:count 本质上就是 prop「count」加上事件「update:count」，二者是同一个声明。",
     "解决：只用 defineModel('count')，不再重复声明 count 属性，组件内部用 model.value 读写即可。"),
    ("问题 4：部署到 GitHub Pages 后页面白屏、资源 404。",
     "原因：项目站点部署在 https://用户名.github.io/仓库名/ 子路径下，"
     "而构建时资源默认以 / 为基准路径；同时刷新子路径会 404。",
     "解决：把 vite.config.js 的 base 改成读取 process.env.BASE_PATH，构建时传入 /仓库名/；"
     "路由改用 Hash 模式（createWebHashHistory），刷新页面不会再打到服务端；并添加 .nojekyll 与 404.html。"),
    ("问题 5：自定义指令生成的高亮 <mark> 在 scoped 样式下不生效。",
     "原因：<mark> 是运行时用 JS 创建的节点，不带 scoped 样式的 data-v 属性。",
     "解决：在组件里用深度选择器 :deep(mark.ny-hl) 写样式，这个问题把「scoped 的实现原理」讲清楚了。"),
    ("问题 6：定时器与全局事件监听未清理，切换页面后仍在执行。",
     "原因：BannerCarousel 的轮播定时器、useScrollBottom / useWindowSize 的 scroll、resize 监听，"
     "如果不主动移除，组件销毁后依然存在，属于内存泄漏。",
     "解决：统一在 onUnmounted 中清理（clearInterval / removeEventListener），"
     "并在实验室里提供了「卸载演示组件」按钮，可以直接观察到 onUnmounted 被触发与清理提示。"),
    ("问题 7：刷新页面后收藏、发布的商品、评论全部丢失。",
     "原因：纯前端项目没有数据库，数据只在内存里。",
     "解决：用 Pinia 的 watch 侦听数据变化并写入 localStorage，初始化时再读回，"
     "同时把读取封装成带 try/catch 的 load()，避免脏数据导致白屏；"
     "收藏页的「收藏备注」则直接用 useLocalStorage 组合式函数实现。"),
]
for q, reason, fix in problems:
    para(doc, q, bold=True, size=10.5, space_after=2, east="黑体")
    para(doc, reason, indent=0.5, space_after=2)
    para(doc, fix, indent=0.5, space_after=10)

section(doc, "七、实验总结")

for text in [
    "本次实验完整走完了「需求分析 → 工程搭建 → 数据与状态设计 → 组件拆分 → 页面组装 → 构建验收 → 部署上线」的全过程，"
    "最终交付 8 个页面、43 个单文件组件、覆盖 Vue 官方教程全部章节的校园二手交易平台，并部署到 GitHub Pages 上可公网访问。",
    "最大的收获是对「数据驱动视图」有了具体的体感：市场页的关键词、分类、价格、排序、页码五个状态全部放在 Pinia 里，"
    "任何一处修改，列表、分页、地址栏、空状态都会同步变化；发布页的实时预览更是没有写一行额外逻辑，"
    "直接复用同一份 form 数据就完成了「一处修改、两处更新」。",
    "其次是搞清了几个之前一直模糊的知识点：computed 的缓存机制（用求值次数直观验证）、"
    "watch 与 watchEffect 的区别、组件 v-model 背后的 prop + update 事件、作用域插槽「子给数据、父定渲染」的分工、"
    "provide/inject 解决深层传参、以及异步组件为什么必须配合 Suspense 使用。",
    "在工程与规范方面也有不少体会：自定义指令里创建的资源要在 unmounted 中释放、"
    "定时器与事件监听必须在 onUnmounted 清理、响应式副作用要有收敛条件（问题 1 就是一次深刻的教训）、"
    "scoped 样式需要 :deep() 才能作用于运行时生成的节点、构建时的 base 与路由模式直接决定部署能否成功。",
    "不足与改进方向：本项目没有后端，数据只存在浏览器里，换设备就会丢失，"
    "后续可以接入 Mock Service Worker 或简单的 Express + SQLite 接口；"
    "图片目前用「分类渐变 + emoji」代替，可以补充真实图片上传与压缩；"
    "分页与筛选在客户端完成，数据量大时应改为服务端分页；"
    "此外还可以引入 TypeScript 做类型约束、用 Vitest 给 store 与组合式函数补单元测试、"
    "用虚拟列表优化超长列表的渲染性能。",
    "通过这次实验，我不仅学会了 Vue 3 的写法，更重要的是理解了它背后的设计思想："
    "把界面拆成可复用的组件，把状态集中管理，把副作用收敛到明确的时机，"
    "再配合清晰的目录结构与自动化验收，才能做出一个「能被讲清楚、能被维护」的前端项目。",
]:
    para(doc, text, indent=0.5, space_after=8)

doc.save(OUT)
print("已生成：", OUT)

# 简单自检
check = Document(OUT)
print("段落数：", len(check.paragraphs))
print("图片数：", len(check.inline_shapes))
heads = [p.text for p in check.paragraphs if p.style.name == "Heading 1"]
print("一级标题：", heads)