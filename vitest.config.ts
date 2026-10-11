import path from 'node:path'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // I test end-to-end (Playwright) stanno in e2e/ e si lanciano con npm run test:e2e.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
