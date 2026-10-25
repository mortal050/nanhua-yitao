import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 项目站点部署在 https://<用户名>.github.io/<仓库名>/ 下，
// 因此构建时需要把资源基础路径设置成仓库名。本地开发用 '/'。
// 通过环境变量 BASE_PATH 覆盖，npm run build 时由 workflow / 命令行传入。
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
})