<script setup lang="ts">
  import { ResetPasswordSchema } from '#shared/validations/auth'

  definePageMeta({ layout: 'auth', middleware: 'auth' })
  useSeoMeta({ title: 'Alterar senha' })

  // Form
  const state = reactive({
    token: '',
    password: '',
    password_confirmation: ''
  })

  const passwordVisible = ref(false)
  const passwordConfirmationVisible = ref(false)
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
      special: /[!@#$%^&*]/.test(password)
    }
  })

  const showPasswordPopover = computed(() => {
    return passwordFocused.value && state.password.length > 0
  })

  const handleSubmit = () => {
    passwordVisible.value = false
    passwordConfirmationVisible.value = false
    submitIsLoading.value = true

    $fetch('/api/v1/auth/reset-password', {
      method: 'POST',
      body: state
    })
      .then(() => {
        toast.add({
          title: 'Senha alterada com sucesso!',
          description: 'Faça login com sua nova senha',
          color: 'success',
          icon: 'i-heroicons-check-circle'
        })

        setTimeout(() => navigateTo('/entrar'), 3000)
      })
      .catch((err) => {
        toast.add({
          title: 'Erro ao alterar senha',
          description: err.data.message,
          color: 'error',
          icon: 'i-heroicons-exclamation-triangle'
        })

        submitIsLoading.value = false
      })
  }

  // Get token from query
  const route = useRoute()
  onMounted(() => {
    const token = route.query.token
    if (token) {
      state.token = token as string
    } else {
      // Redirect to forgot password if no token
      navigateTo('/esqueci-minha-senha')
    }
  })
</script>

<template>
  <div>
    <header class="flex flex-col items-center justify-center mb-8">
      <h1 class="text-3xl">Alterar senha</h1>
      <p class="text-neutral-500 mt-2 text-center">Digite sua nova senha para continuar</p>
    </header>

    <UForm
      :state="state"
      :schema="ResetPasswordSchema"
      class="flex flex-col gap-4"
      @submit="handleSubmit"
    >
      <UPopover :open="showPasswordPopover">
        <UFormField name="password" label="Nova senha">
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
                  Um caractere especial (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>
        </template>
      </UPopover>

      <UFormField name="password_confirmation" label="Confirmar nova senha">
        <UInput
          v-model="state.password_confirmation"
          :type="passwordConfirmationVisible ? 'text' : 'password'"
          placeholder="********"
          class="block"
          :disabled="submitIsLoading"
        >
          <template #trailing>
            <UPopover mode="hover">
              <Icon
                :name="passwordConfirmationVisible ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                class="cursor-pointer"
                :class="{ 'opacity-50 !cursor-not-allowed': submitIsLoading }"
                @click="passwordConfirmationVisible = !passwordConfirmationVisible"
              />

              <template #content>
                <p class="flex items-center gap-2 text-xs p-2">
                  <span>{{ passwordConfirmationVisible ? 'Ocultar senha' : 'Mostrar senha' }}</span>
                </p>
              </template>
            </UPopover>
          </template>
        </UInput>
      </UFormField>

      <UButton type="submit" size="sm" block :loading="submitIsLoading"> Alterar senha </UButton>
    </UForm>

    <div class="flex flex-col items-center justify-center gap-4 mt-8">
      <span class="text-sm text-neutral-500">
        Lembrou sua senha? <NuxtLink to="/entrar">Faça login</NuxtLink>
      </span>
    </div>
  </div>
</template>
