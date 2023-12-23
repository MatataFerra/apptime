import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'


 
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['**/?(*.)test.ts?(x)'],
    exclude: ['src/e2e/**/*', 'node_modules/**/*', 'dist/**/*', 'coverage/**/*', '.next/**/*'],
    globals: true,
    setupFiles: '__test__/vitest.setup.ts',
  },
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
  }
})
