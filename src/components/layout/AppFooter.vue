<script setup>
/**
 * 页脚
 * 知识点：inject 读取根组件 provide 的站点信息；具名插槽的默认内容；v-for 渲染链接
 */
import { inject } from 'vue'

const siteInfo = inject('siteInfo', { name: '南华易淘', slogan: '', version: '-' })

const columns = [
  { title: '逛一逛', links: [{ text: '二手市场', to: '/market' }, { text: '我的收藏', to: '/favorites' }, { text: '发布闲置', to: '/publish' }] },
  { title: '开发者', links: [{ text: 'Vue 实验室', to: '/lab' }, { text: '关于本站', to: '/about' }] },
  { title: '帮助中心', links: [{ text: '交易守则', to: '/about#rules' }, { text: '常见问题', to: '/about#faq' }] },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <div class="row">
          <span class="footer__mark">易</span>
          <div>
            <strong>{{ siteInfo.name }}</strong>
            <p class="small muted">{{ siteInfo.slogan }}</p>
          </div>
        </div>
        <p class="small muted footer__note">
          本站为《Web 全栈开发》课程实验作品，纯前端实现，数据仅保存在浏览器 localStorage 中，请勿用于真实交易。
        </p>
      </div>

      <div v-for="col in columns" :key="col.title" class="footer__col">
        <h4>{{ col.title }}</h4>
        <ul>
          <li v-for="link in col.links" :key="link.text">
            <RouterLink :to="link.to">{{ link.text }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="footer__col">
        <h4>课程信息</h4>
        <ul class="small muted">
          <li>课程：Web 全栈开发</li>
          <li>作者：吴星雨 20244081131</li>
          <li>班级：24 数信 01 班</li>
          <li>版本：v{{ siteInfo.version }}</li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="container row-between wrap">
        <span class="small muted">© {{ year }} 南华易淘 · 计算机学院</span>
        <span class="small muted">Vue 3 + Vite + Vue Router + Pinia 构建</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 40px;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
}

.footer__inner {
  display: grid;
  grid-template-columns: 1.6fr repeat(3, 1fr);
  gap: 28px;
  padding: 38px 20px 26px;
}

.footer__mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, var(--brand), var(--accent));
}

.footer__note {
  margin-top: 14px;
  max-width: 320px;
}

.footer__col h4 {
  font-size: 14px;
  margin-bottom: 10px;
}

.footer__col li {
  margin-bottom: 7px;
  font-size: 13.5px;
  color: var(--text-muted);
}

.footer__col a:hover {
  color: var(--brand-strong);
}

.footer__bottom {
  border-top: 1px solid var(--border);
  padding: 14px 0;
}

@media (max-width: 860px) {
  .footer__inner {
    grid-template-columns: 1fr 1fr;
  }
}
</style>