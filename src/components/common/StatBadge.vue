<script setup>
/**
 * 数字看板徽章（在 main.js 里 app.component('StatBadge') 全局注册，
 * 因此任意组件模板中可直接写 <StatBadge>，无需 import）
 * 知识点：props 校验、props 默认值、computed 派生、作用域样式
 */
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, default: '📊' },
  suffix: { type: String, default: '' },
  trend: { type: Number, default: 0 }, // 正数上升、负数下降，0 不显示
  color: { type: String, default: 'var(--brand)' },
})

const trendText = () => (props.trend > 0 ? `↑ ${props.trend}%` : `↓ ${Math.abs(props.trend)}%`)
</script>

<template>
  <div class="stat" :style="{ '--stat-color': color }">
    <span class="stat__icon">{{ icon }}</span>
    <div class="stat__body">
      <div class="stat__value">
        {{ value }}<small v-if="suffix">{{ suffix }}</small>
      </div>
      <div class="stat__label">{{ label }}</div>
    </div>
    <span v-if="trend" class="stat__trend" :class="{ 'is-down': trend < 0 }">{{ trendText() }}</span>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
}

.stat__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 18px;
  background: color-mix(in srgb, var(--stat-color) 14%, transparent);
}

.stat__value {
  font-size: 21px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--stat-color);
}

.stat__value small {
  font-size: 12px;
  margin-left: 2px;
  font-weight: 600;
}

.stat__label {
  font-size: 12.5px;
  color: var(--text-muted);
}

.stat__trend {
  margin-left: auto;
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: 999px;
  color: #fff;
  background: var(--brand);
}

.stat__trend.is-down {
  background: var(--danger);
}
</style>