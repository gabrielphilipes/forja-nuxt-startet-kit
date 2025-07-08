<script setup lang="ts">
  const siteName = process.env.SITE_NAME || 'Forja'
</script>

<template>
  <header class="flex items-center justify-between w-full h-16 px-4">
    <NuxtLink to="/" class="flex items-center justify-between w-full h-full">
      <img src="assets/images/logo.svg" :alt="siteName" class="size-20 md:size-16 dark:invert" />
    </NuxtLink>

    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </header>
</template>
