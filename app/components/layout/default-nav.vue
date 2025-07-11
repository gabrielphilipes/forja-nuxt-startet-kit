<script setup lang="ts">
  import type { NavigationMenuItem, SelectItem } from '@nuxt/ui'

  const siteName = useRuntimeConfig().public.site_name

  // Start: close button
  defineProps<{
    showCloseButton?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  // End: close button

  // Start: teams
  const selectedTeam = ref<string>('time_2')

  const teams: SelectItem[] = [
    { label: 'time 1', value: 'time_1' },
    { label: 'time 2', value: 'time_2' },
    { label: 'time 3', value: 'time_3' }
  ]
  // End: teams

  // Start: navigation items
  const navigationItems: NavigationMenuItem[] = [
    {
      label: 'Início',
      to: '/dashboard',
      icon: 'material-symbols:home-outline-rounded'
    }
  ]
  // End: navigation items
</script>

<template>
  <header class="flex flex-col gap-2 p-3">
    <div class="flex items-center justify-between">
      <ULink to="/" class="w-18 md:w-12">
        <img src="/assets/images/logo.svg" :alt="siteName" :title="siteName" class="dark:invert" />
      </ULink>

      <UButton
        v-if="showCloseButton"
        color="neutral"
        variant="ghost"
        size="sm"
        icon="gridicons:cross"
        @click="emit('close')"
      />
    </div>

    <USelect
      v-model="selectedTeam"
      :items="teams"
      size="sm"
      trailing-icon="lucide:chevrons-up-down"
    >
      <template #content-bottom>
        <div class="flex flex-col gap-2 p-2">
          <USeparator />

          <UButton
            variant="soft"
            class="w-full"
            size="sm"
            icon="ic:baseline-add"
            label="Novo time"
          />
        </div>
      </template>
    </USelect>
  </header>

  <USeparator class="mb-4 mt-2 px-3" />

  <nav class="flex-1 px-2">
    <UNavigationMenu orientation="vertical" :items="navigationItems" />
  </nav>

  <footer>
    <LayoutDefaultUserMenu />
  </footer>
</template>
