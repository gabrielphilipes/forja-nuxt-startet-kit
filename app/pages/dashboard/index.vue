<script setup lang="ts">
  import type { UserLogin } from '#server/models/user'

  const user = useState<UserLogin | null>('user')

  definePageMeta({ middleware: 'front' })

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
