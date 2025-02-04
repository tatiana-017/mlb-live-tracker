import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ghPages } from 'vite-plugin-gh-pages'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ghPages()
  ],
  base: "mlb-live-tracker",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
