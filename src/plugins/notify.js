/**
 * 自定义插件 —— 官方教程《插件》
 * 一个插件可以是一个带 install(app, options) 方法的对象。
 * 这里实现「全局轻提示」：
 *   - app.provide('notify', notify)      → 后代组件用 inject('notify') 取用
 *   - app.config.globalProperties.$notify → 模板里可直接 $notify(...)
 *   - app.component('ToastHost', ...)     → 插件内顺便全局注册组件
 */
import { reactive } from 'vue'
import ToastHost from '@/components/common/ToastHost.vue'

/** 由 ToastHost 渲染的通知队列（模块级响应式数组，全站共享） */
export const toasts = reactive([])

let seed = 0

/**
 * @param {string} message 文案
 * @param {'info'|'success'|'warn'|'error'} type 类型
 * @param {number} duration 毫秒，0 表示不自动关闭
 */
export function notify(message, type = 'info', duration = 2600) {
  const id = ++seed
  toasts.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration)
  }
  return id
}

export function dismiss(id) {
  const idx = toasts.findIndex((t) => t.id === id)
  if (idx > -1) toasts.splice(idx, 1)
}

export default {
  install(app, options = {}) {
    const prefix = options.prefix || ''
    const wrapped = (msg, type, duration) => notify(`${prefix}${msg}`, type, duration)

    app.provide('notify', wrapped) // 依赖注入：任何后代组件都能 inject('notify')
    app.config.globalProperties.$notify = wrapped // 全局属性：模板里 $notify('已收藏')
    app.component('ToastHost', ToastHost) // 插件内全局注册组件

    console.log('[插件已安装] 全局轻提示就绪', options)
  },
}

export const useNotify = () => notify