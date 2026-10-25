/**
 * 分类字典 + 成色字典（供筛选、发布表单、卡片展示共用）
 */
export const CATEGORIES = [
  { id: 'book', name: '教材书籍', icon: '📚', color: '#4f7cff' },
  { id: 'digital', name: '电子数码', icon: '💻', color: '#0f9d76' },
  { id: 'daily', name: '生活用品', icon: '🧺', color: '#f59e0b' },
  { id: 'sports', name: '运动器材', icon: '🏀', color: '#ef4444' },
  { id: 'bike', name: '代步工具', icon: '🚲', color: '#8b5cf6' },
  { id: 'exam', name: '考研资料', icon: '📝', color: '#06b6d4' },
  { id: 'cloth', name: '服饰鞋包', icon: '🧥', color: '#ec4899' },
  { id: 'other', name: '其他闲置', icon: '🎁', color: '#64748b' },
]

export const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c
  return acc
}, {})

export const CONDITIONS = ['全新未拆', '几乎全新', '轻微使用痕迹', '正常使用痕迹']

export const CAMPUS_SPOTS = ['雨母校区·图书馆', '红湘校区·一教', '学生公寓 7 栋', '第二食堂门口', '体育馆', '新校区·菜鸟驿站']

/** 分类 → 渐变封面（无图片资源也能有好看的视觉，纯前端 demo 很实用） */
export function coverGradient(categoryId, seed = 0) {
  const base = CATEGORY_MAP[categoryId]?.color || '#0f9d76'
  const angle = 120 + ((seed * 37) % 120)
  return `linear-gradient(${angle}deg, ${base} 0%, ${shade(base, -18)} 55%, ${shade(base, 18)} 100%)`
}

function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.min(255, Math.max(0, (num >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}