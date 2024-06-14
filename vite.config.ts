import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { DEFAULT_PORT, PATH_TO_SERVERLESS_FUNCTIONS } from './common/constants'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: './src/auto-imports.d.ts'
    }),
    Components({
      dirs: './src/components',
      dts: './src/components.d.ts',
      resolvers: [ElementPlusResolver()]
    })
  ],

  server: {
    port: 6867,
    proxy: {
      [PATH_TO_SERVERLESS_FUNCTIONS]: {
        target: `http://127.0.0.1:${DEFAULT_PORT}`,
        changeOrigin: true
      }
    }
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@commonTypes': fileURLToPath(
        new URL('./common/types.ts', import.meta.url)
      )
    }
  }
})
