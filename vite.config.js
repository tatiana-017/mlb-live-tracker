import { fileURLToPath, URL } from 'node:url'
import { ghPages } from 'vite-plugin-gh-pages'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
