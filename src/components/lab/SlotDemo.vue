<script setup>
/**
 * 演示 8：插槽
 * 覆盖：默认插槽、具名插槽、作用域插槽、动态插槽名、插槽后备内容、$slots 判断
 */
import { ref } from 'vue'

const slots = ref(['header', 'default', 'footer'])
const dynamicSlot = ref('header')
const showFooter = ref(true)

// 作用域插槽用的数据源
const products = [
  { id: 1, name: '罗技 M330 鼠标', price: 45, stock: 3 },
  { id: 2, name: '考研数学 30 讲', price: 38, stock: 1 },
  { id: 3, name: '宿舍台灯', price: 26, stock: 0 },
]
</script>

<template>
  <div class="demo">
    <div class="demo__block">
      <h4>① 默认插槽 / 具名插槽 / 后备内容</h4>
      <div class="row wrap" style="margin-bottom: 12px">
        <span class="small muted">动态插槽名：</span>
        <select v-model="dynamicSlot" class="select" style="width: auto">
          <option value="header">header</option>
          <option value="default">default</option>
          <option value="footer">footer</option>
        </select>
        <label class="check small"><input v-model="showFooter" type="checkbox" /> 传入 footer 插槽</label>
      </div>

      <!-- 这里没有可用的子组件，直接用 BaseModal 式的手写面板演示：
           下方自定义了一个 <SlotPanel> 内联组件来承载插槽内容 -->
      <SlotPanel :use-dynamic="dynamicSlot">
        <!-- 具名插槽写法一：#header -->
        <template #header>
          <div class="slot-head">
            <strong>📦 待处理订单</strong>
            <span class="tag tag-brand">3 件</span>
          </div>
        </template>

        <!-- 默认插槽：没有名字的内容都会进 default -->
        <p class="small">
          我是默认插槽内容。父组件写在这里的内容会出现在子组件 <code>&lt;slot&gt;</code> 的位置。
        </p>
        <p class="small muted">
          子组件里如果没有 <code>&lt;slot&gt;</code>，这些内容会被直接丢弃。
        </p>

        <!-- 具名插槽写法二：v-slot:footer -->
        <template v-slot:footer>
          <button class="btn small btn-primary">全部确认收货</button>
          <button class="btn small">联系卖家</button>
        </template>
      </SlotPanel>
    </div>

    <div class="demo__block">
      <h4>② 作用域插槽：子组件把数据「回传」给父组件决定怎么渲染</h4>
      <table class="table">
        <thead>
          <tr>
            <th>商品</th>
            <th>价格</th>
            <th>库存（父组件自定义渲染）</th>
          </tr>
        </thead>
        <tbody>
          <!-- 作用域插槽：子组件把 { product, index } 传给父组件 -->
          <ScopeTable :items="products">
            <template #row="{ product, index }">
              <tr>
                <td>{{ index + 1 }}. {{ product.name }}</td>
                <td>¥{{ product.price }}</td>
                <td>
                  <span v-if="product.stock > 0" class="tag tag-brand">有货（剩 {{ product.stock }}）</span>
                  <span v-else class="tag" style="color: var(--danger)">已售罄</span>
                </td>
              </tr>
            </template>
          </ScopeTable>
        </tbody>
      </table>
      <p class="small muted">
        同一份数据，父组件可以渲染成表格、卡片或图表 —— 渲染逻辑由使用者决定，这就是作用域插槽的价值。
      </p>
    </div>
  </div>
</template>

<script>
/**
 * 局部注册两个仅在本演示中使用的组件 —— 演示「局部注册 + defineComponent」的写法。
 * 在 <script setup> 中直接写 const Comp = { ... } 也可以，但用 defineComponent 更清晰。
 */
import { Fragment, defineComponent, h } from 'vue'

const SlotPanel = defineComponent({
  name: 'SlotPanel',
  props: {
    useDynamic: { type: String, default: 'header' },
  },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'slot-panel' }, [
        // 动态插槽名：slots[props.useDynamic] 取到对应名字的插槽
        h('div', { class: 'slot-panel__head' }, slots[props.useDynamic]?.() ?? '（这个插槽没有内容）'),
        h('div', { class: 'slot-panel__body' }, slots.default ? slots.default() : '（默认插槽为空）'),
        h(
          'div',
          { class: 'slot-panel__foot' },
          // $slots.footer 不存在时使用后备内容
          slots.footer ? slots.footer() : h('span', { class: 'small muted' }, '（父组件没有传 footer 插槽）')
        ),
      ])
  },
})

const ScopeTable = defineComponent({
  name: 'ScopeTable',
  props: { items: { type: Array, default: () => [] } },
  setup(props, { slots }) {
    // 用 Fragment 渲染多行 <tr>，避免在 <tbody> 里再嵌套一个 <tbody>
    return () =>
      h(
        Fragment,
        props.items.map((product, index) =>
          // 把数据通过「插槽 props」传出去，由父组件决定怎么渲染
          slots.row ? slots.row({ product, index }) : h('tr', [h('td', product.name)])
        )
      )
  },
})

export default { components: { SlotPanel, ScopeTable } }
</script>

<style scoped>
.slot-panel {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

:deep(.slot-panel__head) {
  background: var(--bg-sunken);
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
}

:deep(.slot-panel__body) {
  padding: 14px;
}

:deep(.slot-panel__foot) {
  padding: 11px 14px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.slot-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.table th {
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12.5px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--text-muted);
}

.check input {
  accent-color: var(--brand);
}
</style>