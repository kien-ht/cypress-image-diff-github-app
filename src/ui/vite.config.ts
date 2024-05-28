import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { __dirname } from '../common/utils-cjs'
import { DEFAULT_PORT, PATH_TO_SERVERLESS_FUNCTIONS } from '../common/constants'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [ElementPlusResolver()],
      dts: './auto-imports.d.ts'
    }),
    Components({
      dirs: './components',
      dts: './components.d.ts',
      resolvers: [ElementPlusResolver()]
    })
  ],

  root: __dirname(import.meta.url),

  build: {
    outDir: '../../dist/ui',
    emptyOutDir: true
  },

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
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '@commonTypes': fileURLToPath(
        new URL('../common/types.ts', import.meta.url)
      )
    }
  }
})
