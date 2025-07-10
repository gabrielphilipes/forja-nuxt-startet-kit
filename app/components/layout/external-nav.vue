<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const props = defineProps<{
    items?: NavigationMenuItem[]
  }>()

  const items = computed(() => props.items || [])
</script>

<template>
  <nav class="flex flex-col items-center justify-start w-full max-w-screen-lg mx-auto px-4 text-sm">
    <UNavigationMenu :items="items" class="justify-start" />
  </nav>
</template>
