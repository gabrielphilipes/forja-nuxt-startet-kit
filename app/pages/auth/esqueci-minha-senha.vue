<script setup lang="ts">
  import { ForgotPasswordSchema } from '#shared/validations/auth'

  definePageMeta({ layout: 'auth', middleware: 'auth' })
  useSeoMeta({ title: 'Recupere seu acesso' })

  // Form
  const state = reactive({
    email: ''
  })

  const submitIsLoading = ref(false)
  const toast = useToast()

  const handleSubmit = () => {
    submitIsLoading.value = true

    $fetch('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: state
    })
      .then(() => {
        toast.add({
          title: 'E-mail enviado com sucesso!',
          description: 'Verifique sua caixa de entrada e siga as instruções',
          color: 'success',
          icon: 'i-heroicons-check-circle'
        })

        setTimeout(() => navigateTo('/entrar'), 3000)
      })
      .catch((err) => {
        toast.add({
          title: 'Erro ao enviar e-mail',
          description: err.data.message,
          color: 'error',
          icon: 'i-heroicons-exclamation-triangle'
        })

        submitIsLoading.value = false
      })
  }

  // Use query data
  const route = useRoute()
  const router = useRouter()
  onMounted(() => {
    const email = route.query.email
    if (email) {
      state.email = email as string
    }

    // Remove query from url
    router.replace('/esqueci-minha-senha')
  })
</script>

<template>
  <div>
    <header class="flex flex-col items-start justify-start mb-8">
      <h1 class="text-3xl">Esqueceu sua senha?</h1>
      <p class="text-neutral-500 mt-2 text-center">
        Digite seu e-mail e enviaremos um link para redefinir sua senha
      </p>
    </header>

    <UForm
      :state="state"
      :schema="ForgotPasswordSchema"
      class="flex flex-col gap-4"
      @submit="handleSubmit"
    >
      <UFormField name="email" label="E-mail">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="`philipes@${useAppConfig().site_name.toLowerCase()}.com`"
          class="block"
          :disabled="submitIsLoading"
        />
      </UFormField>

      <UButton type="submit" size="sm" block :loading="submitIsLoading">
        Enviar e-mail de recuperação
      </UButton>
    </UForm>

    <div class="flex flex-col items-center justify-center gap-4 mt-8">
      <span class="text-sm text-neutral-500">
        Lembrou sua senha? <NuxtLink to="/entrar">Faça login</NuxtLink>
      </span>
    </div>
  </div>
</template>
