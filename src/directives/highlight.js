/**
 * 自定义指令 —— 官方教程《自定义指令》
 * v-highlight：给关键词打上高亮背景（用于搜索结果的标题/描述）
 *
 * 指令钩子顺序：created → beforeMount → mounted → beforeUpdate → updated → beforeUnmount → unmounted
 * 这里用「对象形式」把指令写成一个可复用模块，在 main.js 里全局注册。
 */
const HIGHLIGHT_CLASS = 'ny-hl'

export default {
  mounted(el, binding) {
    render(el, binding)
  },
  updated(el, binding) {
    render(el, binding)
  },
  unmounted(el) {
    el.innerHTML = el.textContent
  },
}

function render(el, binding) {
  const keyword = String(binding.value || '').trim()
  const text = el.textContent
  if (!keyword) {
    el.innerHTML = escapeHtml(text)
    return
  }
  const safeKeyword = escapeRegExp(keyword)
  const re = new RegExp(`(${safeKeyword})`, 'gi')
  el.innerHTML = escapeHtml(text).replace(
    re,
    `<mark class="${HIGHLIGHT_CLASS}">$1</mark>`
  )
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}