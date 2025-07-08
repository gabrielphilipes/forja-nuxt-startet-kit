<script setup lang="ts">
  definePageMeta({ layout: 'auth' })

  // Form
  const state = reactive({
    email: '',
    password: ''
  })

  const passwordVisible = ref(false)
  const submitIsLoading = ref(false)

  const handleSubmit = (e: Event) => {
    console.log(e)

    passwordVisible.value = false
    submitIsLoading.value = true

    setTimeout(() => {
      submitIsLoading.value = false
    }, 2000)
  }

  const changePasswordVisibility = () => {
    if (submitIsLoading.value) return

    passwordVisible.value = !passwordVisible.value
  }
</script>

<template>
  <div>
    <header class="flex flex-col items-center justify-center mb-8">
      <h1 class="text-3xl">Que bom te ver novamente!</h1>
    </header>

    <UForm :state="state" class="flex flex-col gap-4" @submit="handleSubmit">
      <UFormField name="email" label="E-mail">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="`gabriel@${useAppConfig().site_name.toLowerCase()}.com`"
          class="block"
          :disabled="submitIsLoading"
        />
      </UFormField>

      <UFormField name="password" label="Senha">
        <UInput
          v-model="state.password"
          :type="passwordVisible ? 'text' : 'password'"
          placeholder="********"
          class="block"
          :disabled="submitIsLoading"
        >
          <template #trailing>
            <UPopover mode="hover">
              <Icon
                :name="passwordVisible ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="cursor-pointer"
                :class="{ 'opacity-50 !cursor-not-allowed': submitIsLoading }"
                @click="changePasswordVisibility"
              />

              <template #content>
                <p class="flex items-center gap-2 text-xs p-2">
                  <span>{{ passwordVisible ? 'Ocultar senha' : 'Mostrar senha' }}</span>
                </p>
              </template>
            </UPopover>
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-between gap-4">
        <NuxtLink to="/esqueci-minha-senha" class="text-sm text-neutral-500 hover:text-primary">
          Esqueceu sua senha?
        </NuxtLink>

        <UButton type="submit" size="sm" :loading="submitIsLoading">Acessar conta</UButton>
      </div>
    </UForm>

    <USeparator class="my-8" label="ou" />

    <div class="flex flex-col items-center justify-center gap-4">
      <span class="text-sm text-neutral-500">
        Não tem uma conta? <NuxtLink to="/cadastrar">Cadastre-se</NuxtLink>
      </span>

      <AuthOauth :disabled-buttons="submitIsLoading" />
    </div>
  </div>
</template>
