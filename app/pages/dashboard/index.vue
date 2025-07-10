<script setup lang="ts">
  import type { UserLogin } from '#server/models/user'

  definePageMeta({ middleware: 'app' })
  useSeoMeta({ title: 'Painel de controle' })

  const user = useState<UserLogin | null>('user')

  const logout = async () => {
    const { clear: logoutUserSession, fetch: refreshUserSession } = useUserSession()
    await logoutUserSession()
    await refreshUserSession()
    await navigateTo('/entrar')
  }
</script>

<template>
  <div>
    <h1>Olá, {{ user?.name }} 👋🏻</h1>

    <UButton @click="logout">Sair</UButton>
  </div>
</template>
