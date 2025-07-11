<script setup lang="ts">
  import type { UserLogin } from '#server/models/user'
  import type { DropdownMenuItem } from '@nuxt/ui'

  const isOpen = ref(false)
  const user = useState<UserLogin>('user')

  const items: DropdownMenuItem[] = [
    {
      label: 'Meu Perfil',
      icon: 'i-lucide-user',
      type: 'link',
      to: '/meu-perfil'
    },
    {
      label: 'Configurações',
      icon: 'i-lucide-cog',
      type: 'link',
      to: '/configuracoes'
    },
    { type: 'separator' },
    {
      label: 'Sair da conta',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: () => {
        console.log('Sair da conta')
      }
    }
  ]
</script>

<template>
  <UDropdownMenu
    v-model:open="isOpen"
    :items="items"
    :content="{ align: 'start' }"
    :ui="{ content: 'w-48 ml-2' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      type="button"
      class="flex items-center justify-between gap-2 w-full"
    >
      <div class="flex flex-1 items-center gap-2">
        <UAvatar
          :alt="user?.name"
          :title="user?.name"
          :aria-label="user?.name"
          src="https://picsum.photos/200"
          class="rounded-lg"
        />
        <div class="flex flex-col text-start max-w-[130px] font-medium text-sm">
          <span class="truncate">{{ user?.name }}</span>
          <span class="text-xs truncate opacity-50">
            {{ user?.email }}
          </span>
        </div>
      </div>

      <UIcon
        name="ic:sharp-keyboard-arrow-down"
        size="16"
        class="transition-transform duration-300"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </UButton>
  </UDropdownMenu>
</template>
