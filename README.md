# 南华易淘 · 校园二手交易平台

> 《Web 全栈开发》课程实验作品 —— 一个用 **Vue 3** 实现的纯前端校园二手交易平台。
> 作者：吴星雨（20244081131，24 数信 01 班，计算机学院）

站点口号：**让闲置在校园里流动起来。**

---

## 一、在线访问

| 类型 | 地址 |
| --- | --- |
| 🌐 **在线站点（GitHub Pages）** | **<https://mortal050.github.io/nanhua-yitao/>** |
| 源码仓库 | <https://github.com/mortal050/nanhua-yitao> |
| 构建产物分支 | `gh-pages` |

已实测：首页 / 市场 / 详情 / 实验室 / 关于 5 条路由线上访问均正常，静态资源可加载，
控制台 0 错误、0 失败请求（用 `SIM_BASE=https://mortal050.github.io/nanhua-yitao/ node tools/verify-subpath.mjs` 复核）。

本地运行：

```bash
npm install          # 安装依赖
npm run dev          # 开发服务器 http://127.0.0.1:5173
npm run build        # 生产构建，输出到 dist/
npm run preview      # 本地预览构建产物 http://127.0.0.1:4173
```

## 二、功能一览

- **首页**：欢迎语（按时段变化）、轮播 Banner、平台数据看板、分类快捷入口、热门推荐、最新发布、异步加载的平台动态。
- **二手市场**：关键词搜索（防抖 + 关键词高亮 + 历史记录）、8 个分类筛选、价格区间、只看可议价、4 种排序、网格/列表视图、分页、骨架屏、空状态；筛选条件与地址栏 query 双向同步。
- **商品详情**：动态路由 `/item/:id`、封面与缩略图、折扣计算、卖家信息、收藏、下单确认弹窗、交易评价（列表 + 发表评价表单）、相似推荐、商品不存在时的兜底。
- **发布闲置**：6 类表单控件全覆盖、实时校验与完成度进度条、**右侧实时预览**、发布成功弹窗、新商品写入市场列表顶部。
- **我的收藏**：收藏价值与省钱统计、清空二次确认、收藏备注（本地持久化）。
- **Vue 知识实验室**：10 个可交互演示，覆盖 Vue 官方教程全部章节；动态组件 + KeepAlive 切换，支持卸载/重新挂载以观察生命周期。
- **关于本站**：技术栈、知识点对照表（25 项）、项目目录结构、常见问题、交易守则。
- **其他**：深色模式、全局轻提示、回到顶部、404 页面、移动端适配（汉堡菜单）。

## 三、技术栈

Vue 3.5（`<script setup>` + 组合式 API）、Vite 6、Vue Router 4（Hash 模式）、Pinia 2、原生 CSS（CSS 变量 + 深色模式）、localStorage 持久化、Playwright（自动化验收与截图）。

## 四、项目结构

```
nanhua-yitao/
├─ index.html
├─ vite.config.js
├─ package.json
├─ tools/
│  ├─ screenshot.mjs        # Playwright 端到端验收 + 截图
│  └─ deploy-gh.mjs         # 一键部署到 GitHub Pages
└─ src/
   ├─ main.js               # createApp / 插件 / 全局组件 / 全局指令
   ├─ App.vue               # 根组件：布局 + 路由出口 + 路由过渡
   ├─ assets/styles/main.css# 设计系统（CSS 变量 / 深色模式）
   ├─ router/index.js       # 路由表 + 全局守卫 + 懒加载
   ├─ stores/
   │  ├─ market.js          # 商品 / 筛选 / 分页 / 收藏 / 评论
   │  └─ user.js            # 登录状态 / 主题 / 搜索历史
   ├─ composables/index.js  # 7 个组合式函数（防抖、本地存储、相对时间…）
   ├─ directives/           # v-highlight、v-ripple
   ├─ plugins/notify.js     # 自定义插件：全局轻提示
   ├─ data/                 # 模拟数据与分类字典
   ├─ components/
   │  ├─ layout/            # AppHeader / AppFooter / ThemeToggle
   │  ├─ common/            # BaseModal / EmptyState / SkeletonCard / StarRating / StatBadge / ToastHost / BackToTop
   │  ├─ market/            # ItemCard / ItemGrid / SearchBar / CategoryFilter / SortBar / PaginationBar / CommentList / CommentForm / FavoriteButton
   │  ├─ home/              # BannerCarousel / FeaturePanel / PlatformTimeline
   │  └─ lab/               # 10 个知识点演示 + CounterPanel / ChartPanel
   └─ views/                # 8 个页面
```

共 **43 个单文件组件（SFC）**、**8 个页面**。

## 五、知识点覆盖（对照 Vue 官方教程）

| 教程章节 | 实现位置 |
| --- | --- |
| 创建一个应用 | `src/main.js` |
| 模板语法 | `components/lab/ReactivityDemo.vue` |
| 响应式基础 | `ReactivityDemo.vue`（ref / reactive） |
| 计算属性 | `ComputedWatchDemo.vue`、`views/MarketView.vue` |
| Class 与 Style 绑定 | `ClassStyleDemo.vue`、`market/ItemCard.vue` |
| 条件渲染 | `ClassStyleDemo.vue`、`views/ItemDetailView.vue` |
| 列表渲染 | `ListRenderDemo.vue`、`market/ItemGrid.vue` |
| 事件处理 | `EventFormDemo.vue`（6 种事件修饰符） |
| 表单输入绑定 | `EventFormDemo.vue`、`views/PublishView.vue` |
| 生命周期钩子 | `LifecycleDemo.vue`、`home/BannerCarousel.vue` |
| 侦听器 | `ComputedWatchDemo.vue`、`stores/market.js` |
| 模板引用 | `AsyncRefDemo.vue`、`market/SearchBar.vue` |
| 组件基础 / 注册 | `main.js` 全局注册、各视图局部注册 |
| Props / 事件 | `lab/CounterPanel.vue` |
| 组件 v-model | `common/BaseModal.vue`、`common/StarRating.vue`、`CounterPanel.vue` |
| 透传 attribute | `market/ItemGrid.vue`、`CounterPanel.vue` |
| 插槽（默认/具名/作用域/动态） | `SlotDemo.vue`、`BaseModal.vue`、`CommentList.vue` |
| 依赖注入 | `App.vue`、`ProvideDirectiveDemo.vue` |
| 异步组件与 Suspense | `AsyncRefDemo.vue`、`views/HomeView.vue` |
| 组合式函数 | `composables/index.js` |
| 自定义指令 | `directives/highlight.js`、`directives/ripple.js` |
| 插件 | `plugins/notify.js` |
| 状态管理（Pinia） | `stores/market.js`、`stores/user.js` |
| 路由 | `router/index.js` |
| 过渡与动画 | `App.vue`、`ToastHost.vue`、`ItemGrid.vue` |

## 六、部署到 GitHub Pages

方式一（推荐，一条命令）：

```powershell
$env:GITHUB_TOKEN="ghp_你的Token"   # 需要 repo 权限
node tools/deploy-gh.mjs            # 自动建仓库、推源码、推 gh-pages、开 Pages
```

方式二（手动）：把 `dist/` 推到一个 `gh-pages` 分支，然后在仓库 **Settings → Pages** 里选择该分支。

> 注意：项目站点部署在子路径下，构建时需要设置 `BASE_PATH=/nanhua-yitao/`（`vite.config.js` 会读取该环境变量），路由使用 Hash 模式以便刷新不 404。

## 七、自动化验收

```bash
npm run build && npm run preview      # 先起本地预览服务
node tools/screenshot.mjs             # 自动走完 20 个场景，输出 25 张截图并检查控制台
```

最近一次验收结果：**25 张截图、0 个控制台错误 / 警告**（截图位于 `screenshots/`）。

## 八、说明

本站为课程实验作品，纯前端实现，所有商品 / 卖家 / 评价均为模拟数据（`src/data/items.js`），用户数据仅保存在浏览器 `localStorage` 中，不涉及任何真实交易。