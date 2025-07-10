<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'

  const props = defineProps<{
    nav?: NavigationMenuItem[]
  }>()

  const nav = computed(() => props.nav || [])
</script>

<template>
  <div>
    <LayoutExternalNav :items="nav" />
    <div class="w-10/12 max-w-xl mx-auto mt-12 md:mt-28">
      <slot />
    </div>
  </div>
</template>
