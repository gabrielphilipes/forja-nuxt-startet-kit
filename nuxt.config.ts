import tailwindcss from '@tailwindcss/vite'
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

    rollupConfig: {
      plugins: [vue()]
    }
  },

  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', 'nuxt-auth-utils', '@nuxt/ui'],

  css: ['~/assets/css/general.css'],

  vite: {
    plugins: [tailwindcss()]
  },

  alias: {
    '#tests': resolve(__dirname, 'tests'),
    '#server': resolve(__dirname, 'server'),
    '#shared': resolve(__dirname, 'shared')
  }
})
