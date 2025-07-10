<script setup lang="ts">
  const { loggedIn } = useUserSession()
  const siteName = process.env.SITE_NAME || 'Forja'
</script>

<template>
  <main class="block mb-32">
    <LayoutHeader>
      <template #actions>
        <div class="flex items-center gap-2">
          <UButton
            v-if="!loggedIn"
            to="/entrar"
            size="sm"
            label="Acessar conta"
            icon="material-symbols-light:login-rounded"
          />

          <UButton v-else to="/dashboard" size="sm" label="Dashboard" icon="ic:baseline-home" />
          <UButton to="/" variant="link" color="neutral" size="sm" label="Ver site" />
        </div>
      </template>
    </LayoutHeader>

    <div class="w-10/12 max-w-xl mx-auto mt-12 md:mt-28">
      <NuxtPage />
    </div>

    <footer class="flex items-center justify-center w-10/12 mx-auto mt-10 text-xs text-neutral-500">
      <p>&copy; {{ new Date().getFullYear() }} {{ siteName }}. Todos os direitos reservados.</p>
    </footer>
  </main>
</template>
