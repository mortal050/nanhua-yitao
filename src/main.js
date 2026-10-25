/**
 * 应用入口 —— Vue 官方教程《创建一个应用》
 * 1. createApp(App) 创建应用实例
 * 2. app.use(router) / app.use(pinia) 安装插件（路由、状态管理、自定义插件）
 * 3. app.component() 全局注册组件
 * 4. app.directive() 全局注册自定义指令
 * 5. app.mount('#app') 挂载到 index.html 的 #app 节点
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import notifyPlugin from './plugins/notify'
import highlight from './directives/highlight'
import ripple from './directives/ripple'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia()) // Pinia 状态管理
app.use(router) // vue-router 路由
app.use(notifyPlugin) // 自定义插件：全局 $notify 轻提示

// 全局注册自定义指令
app.directive('highlight', highlight)
app.directive('ripple', ripple)

// 全局注册组件（官方教程《组件注册》：全局注册的组件可在任意组件模板中直接使用）
import StatBadge from './components/common/StatBadge.vue'
app.component('StatBadge', StatBadge)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[全局错误处理]', info, err)
}

app.mount('#app')