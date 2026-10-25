<script setup>
/**
 * 404 页面
 * 知识点：
 *  - 通配路由 /:pathMatch(.*)* 的落点
 *  - useRoute 读取当前路径并展示
 *  - 编程式导航 router.back() / router.push()
 */
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <div class="page fade-up">
    <div class="container">
      <div class="nf card">
        <div class="nf__code">404</div>
        <h1>这个页面被同学淘走了</h1>
        <p class="muted">
          没有找到路径 <code>{{ route.fullPath }}</code> 对应的页面。
        </p>
        <div class="row wrap" style="justify-content: center">
          <button class="btn" @click="router.back()">返回上一页</button>
          <RouterLink class="btn btn-primary" :to="{ name: 'home' }">回到首页</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nf {
  text-align: center;
  padding: 70px 20px;
  display: grid;
  gap: 14px;
  justify-items: center;
}

.nf__code {
  font-size: 92px;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, var(--brand), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

code {
  background: var(--bg-sunken);
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 13px;
}
</style>