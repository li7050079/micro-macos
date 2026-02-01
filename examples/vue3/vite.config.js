import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    minify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'vue3-subapp',
        globals: {
          vue: 'Vue'
        }
      }
    }
  },
  // 开发环境配置
  define: {
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  server: {
    port: 8081,
    cors: true,
    origin: 'http://localhost:8081'
  }
})