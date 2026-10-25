/**
 * 路由配置 —— vue-router 4
 * 知识点：
 *  - createRouter / createWebHashHistory（Hash 模式，GitHub Pages 刷新不会 404）
 *  - 路由懒加载：() => import(...) 打包时自动分包（官方教程：异步组件）
 *  - 动态路由参数 /item/:id、通配路由 /:pathMatch(.*)*
 *  - meta 元信息（标题、是否需要登录）+ 全局前置守卫
 */
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页' } },
  {
    path: '/market',
    name: 'market',
    // 懒加载：只有访问该路由时才会下载对应 chunk
    component: () => import('@/views/MarketView.vue'),
    meta: { title: '二手市场' },
  },
  {
    path: '/item/:id',
    name: 'item-detail',
    component: () => import('@/views/ItemDetailView.vue'),
    meta: { title: '商品详情' },
    props: true, // 把路由参数作为 props 传给组件，组件不必依赖 useRoute
  },
  {
    path: '/publish',
    name: 'publish',
    component: () => import('@/views/PublishView.vue'),
    meta: { title: '发布闲置', requiresLogin: true },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: '我的收藏' },
  },
  {
    path: '/lab',
    name: 'lab',
    component: () => import('@/views/LabView.vue'),
    meta: { title: 'Vue 知识实验室' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: '关于本站' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

// 全局前置守卫：演示路由跳转拦截 + 修改文档标题
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 南华易淘` : '南华易淘 · 校园二手交易平台'
  // 发布页需要“登录”，这里用 localStorage 里的模拟账号判断
  if (to.meta.requiresLogin && !localStorage.getItem('ny-user')) {
    return { name: 'home', query: { redirect: to.fullPath, needLogin: '1' } }
  }
  return true
})

export default router