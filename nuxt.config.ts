import routesCustom from './app/routes.config.ts'
import tailwindcss from '@tailwindcss/vite'
import type { NuxtPage } from 'nuxt/schema'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },
  srcDir: 'app',
  serverDir: 'server',
  nitro: {
    preset: 'vercel',
    rollupConfig: { plugins: [vue()] }
  },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', 'nuxt-auth-utils', '@nuxt/ui'],

  css: ['~/assets/css/general.css'],

  vite: { plugins: [tailwindcss()] },

  alias: {
    '#server': resolve(__dirname, 'server'),
    '#app': resolve(__dirname, 'app'),
    '#tests': resolve(__dirname, 'tests'),
    '#shared': resolve(__dirname, 'shared')
  },

  hooks: {
    'pages:extend': (pages: NuxtPage[]) => {
      pages.push(...routesCustom)
    }
  }
})
