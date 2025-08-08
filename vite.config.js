import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  publicPath: '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'holdem',//想要把dist修改成什么名字在这边改
  }
})
