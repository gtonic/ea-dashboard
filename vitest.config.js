import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      vue: path.resolve(__dirname, 'tests/mocks/vue-mock.js'),
    },
  },
})
