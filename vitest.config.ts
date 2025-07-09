import { defineVitestConfig } from '@nuxt/test-utils/config'
import { loadEnv } from 'vite'

export default defineVitestConfig({
  test: {
    env: loadEnv('', process.cwd(), ''),
    environment: 'nuxt',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 60000,
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.vue', 'app/**/*']
  }
})
