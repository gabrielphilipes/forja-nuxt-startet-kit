<template>
  <header class="flex items-center justify-between w-full h-16 px-4">
    <NuxtLink to="/" class="w-full h-full flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Forja</h1>
    </NuxtLink>

    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </header>
</template>
