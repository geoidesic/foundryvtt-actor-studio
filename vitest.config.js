import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.js'],
    env: {
      NODE_ENV: 'test'
    }
  },
  resolve: {
    alias: {
      '~': __dirname,
      '~/src': './src'
    }
  },
  define: {
    global: 'globalThis'
  }
}) 