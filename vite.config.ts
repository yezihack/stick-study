import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
// base 仅在 GitHub Pages 部署时设为子路径，APK / 本地开发保持 '/'
// （APK 由 Capacitor 本地加载，必须用 '/'，因此不能用 NODE_ENV 判断）
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/stick-study/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 7002
  }
})
