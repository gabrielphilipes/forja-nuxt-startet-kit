<script setup lang="ts">
  import { RegisterUserSchema } from '#shared/validations/auth'

  definePageMeta({ layout: 'auth' })

  // Form
  const state = reactive({
    name: '',
    email: '',
    password: ''
  })

  const passwordVisible = ref(false)
  const submitIsLoading = ref(false)
  const passwordFocused = ref(false)
  const toast = useToast()

  // Password validation rules
  const passwordRules = computed(() => {
    const password = state.password
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*.,]/.test(password)
    }
  })

  const showPasswordPopover = computed(() => {
    return passwordFocused.value && state.password.length > 0
  })

  const handleSubmit = () => {
    passwordVisible.value = false
    submitIsLoading.value = true

    $fetch('/api/v1/auth/register', {
      method: 'POST',
      body: state
    })
      .then(() => {
        toast.add({
          title: 'Conta criada com sucesso!',
          description: 'Faça login para continuar',
          color: 'success',
          icon: 'i-heroicons-check-circle'
        })

        setTimeout(() => navigateTo(`/entrar?email=${state.email}`), 2000)
      })
      .catch((err) => {
        toast.add({
          title: 'Erro ao criar conta',
          description: err.data.message,
          color: 'error',
          icon: 'i-heroicons-exclamation-triangle'
        })

        submitIsLoading.value = false
      })
  }
</script>

<template>
  <div>
    <header class="flex flex-col items-center justify-center mb-8">
      <h1 class="text-3xl">Crie sua conta</h1>
    </header>

    <UForm
      :state="state"
      :schema="RegisterUserSchema"
      class="flex flex-col gap-4"
      @submit="handleSubmit"
    >
      <UFormField name="name" label="Nome completo">
        <UInput
          v-model="state.name"
          type="text"
          placeholder="Seu nome completo"
          class="block"
          :disabled="submitIsLoading"
          autofocus
        />
      </UFormField>

      <UFormField name="email" label="E-mail">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="`philipes@${useAppConfig().site_name.toLowerCase()}.com`"
          class="block"
          :disabled="submitIsLoading"
        />
      </UFormField>

      <UPopover :open="showPasswordPopover">
        <UFormField name="password" label="Senha">
          <UInput
            v-model="state.password"
            :type="passwordVisible ? 'text' : 'password'"
            placeholder="********"
            class="block"
            :disabled="submitIsLoading"
            @focus="passwordFocused = true"
            @blur="passwordFocused = false"
          >
            <template #trailing>
              <UPopover mode="hover">
                <Icon
                  :name="passwordVisible ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  class="cursor-pointer"
                  :class="{ 'opacity-50 !cursor-not-allowed': submitIsLoading }"
                  @click="passwordVisible = !passwordVisible"
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

        <!-- Password validation popover -->
        <template #content>
          <div class="p-3">
            <div class="text-xs text-neutral-600 mb-2">Sua senha deve conter:</div>
            <div class="space-y-1 text-xs">
              <div class="flex items-center gap-2">
                <Icon
                  :name="passwordRules.length ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordRules.length ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="passwordRules.length ? 'text-green-600' : 'text-red-600'">
                  Pelo menos 8 caracteres
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Icon
                  :name="
                    passwordRules.uppercase ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                  "
                  :class="passwordRules.uppercase ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="passwordRules.uppercase ? 'text-green-600' : 'text-red-600'">
                  Uma letra maiúscula
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Icon
                  :name="
                    passwordRules.lowercase ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                  "
                  :class="passwordRules.lowercase ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="passwordRules.lowercase ? 'text-green-600' : 'text-red-600'">
                  Uma letra minúscula
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Icon
                  :name="passwordRules.number ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                  :class="passwordRules.number ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="passwordRules.number ? 'text-green-600' : 'text-red-600'">
                  Um número
                </span>
              </div>
              <div class="flex items-center gap-2">
                <Icon
                  :name="
                    passwordRules.special ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'
                  "
                  :class="passwordRules.special ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="passwordRules.special ? 'text-green-600' : 'text-red-600'">
                  Um caractere especial (!@#$%^&*.,)
                </span>
              </div>
            </div>
          </div>
        </template>
      </UPopover>

      <UButton type="submit" size="sm" block :loading="submitIsLoading"> Criar conta </UButton>
    </UForm>

    <USeparator class="my-8" label="ou" />

    <div class="flex flex-col items-center justify-center gap-4">
      <span class="text-sm text-neutral-500">
        Já tem uma conta? <NuxtLink to="/entrar">Faça login</NuxtLink>
      </span>

      <AuthOauth :disabled-buttons="submitIsLoading" />
    </div>
  </div>
</template>
