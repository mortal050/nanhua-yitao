/**
 * 自定义指令 v-ripple：点击时在元素上扩散一圈水波纹。
 * 演示：mounted 中绑定事件、unmounted 中解绑（避免内存泄漏），
 *      以及 binding.modifiers / binding.value 的用法。
 */
export default {
  mounted(el, binding) {
    const color = binding.value || 'rgba(255,255,255,0.55)'
    const duration = binding.modifiers.slow ? 900 : 520

    el.style.position = el.style.position || 'relative'
    el.style.overflow = 'hidden'

    const handler = (event) => {
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const span = document.createElement('span')
      span.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${size}px;height:${size}px;left:${event.clientX - rect.left - size / 2}px;
        top:${event.clientY - rect.top - size / 2}px;background:${color};
        transform:scale(0);opacity:.75;transition:transform ${duration}ms ease-out,opacity ${duration}ms ease-out;
      `
      el.appendChild(span)
      requestAnimationFrame(() => {
        span.style.transform = 'scale(1)'
        span.style.opacity = '0'
      })
      setTimeout(() => span.remove(), duration + 60)
    }

    el.addEventListener('click', handler)
    // 把清理函数挂在元素上，unmounted 时取出来调用
    el._rippleCleanup = () => el.removeEventListener('click', handler)
  },
  unmounted(el) {
    el._rippleCleanup?.()
    delete el._rippleCleanup
  },
}