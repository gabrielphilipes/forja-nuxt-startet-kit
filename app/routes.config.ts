import type { NuxtPage } from 'nuxt/schema'

export default <NuxtPage[]>[
  // Auth routes
  { path: '/entrar', file: '~/pages/auth/entrar.vue' },
  { path: '/cadastrar', file: '~/pages/auth/cadastrar.vue' },
  { path: '/alterar-senha', file: '~/pages/auth/alterar-senha.vue' },
  { path: '/esqueci-minha-senha', file: '~/pages/auth/esqueci-minha-senha.vue' }
]
