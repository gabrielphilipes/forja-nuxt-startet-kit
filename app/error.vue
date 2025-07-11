<script setup lang="ts">
  import type { NuxtError } from '#app'

  const { loggedIn } = useUserSession()
  const siteName = process.env.SITE_NAME || 'Forja'

  defineProps({
    error: {
      type: Object as () => NuxtError,
      required: true
    }
  })

  const { path } = useRoute()

  const friendlyMessage = {
    404: {
      title: 'Página não encontrada',
      description: `Por favor, confirme se o link está correto. Não encontramos a página "${path}" que você tentou acessar.`
    },
    500: {
      title: 'Erro interno do servidor',
      description: 'Ocorreu um erro ao carregar a página. Por favor, tente novamente mais tarde.'
    },
    403: {
      title: 'Acesso negado',
      description: 'Você não tem permissão para acessar esta página. Por favor, contate o suporte.'
    },
    401: {
      title: 'Não autorizado',
      description: 'Você não está autorizado a acessar esta página. Por favor, contate o suporte.'
    },
    400: {
      title: 'Requisição inválida',
      description: 'A requisição que você fez é inválida. Por favor, tente novamente.'
    }
  }

  const handleError = () => {
    clearError()
    window.history.back()
  }
</script>

<template>
  <main class="flex flex-col h-full mb-32">
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

    <LayoutExternalContent class="flex-1">
      <div class="flex flex-col items-start gap-2">
        <p class="text-sm font-bold">{{ error?.statusCode }}</p>
        <h1 class="text-4xl font-bold">
          {{ friendlyMessage[error.statusCode as keyof typeof friendlyMessage].title }}
        </h1>
        <p class="text-sm text-neutral-500">
          {{ friendlyMessage[error.statusCode as keyof typeof friendlyMessage].description }}
        </p>

        <UButton
          variant="soft"
          label="Voltar"
          icon="material-symbols-light:arrow-back"
          class="mt-10 font-semibold cursor-pointer"
          @click="handleError"
        />
      </div>

      <footer class="flex items-center justify-start mt-36 text-xs text-neutral-500">
        <p>&copy; {{ new Date().getFullYear() }} {{ siteName }}. Todos os direitos reservados.</p>
      </footer>
    </LayoutExternalContent>
  </main>
</template>
