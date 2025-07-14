<script setup lang="ts">
  defineProps<{
    title: string
    description?: string
    icon?: string
  }>()
</script>

<template>
  <section class="flex flex-col gap-4 mt-[50px] md:mt-0 md:mr-5">
    <header
      class="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3 md:gap-0 mb-5"
    >
      <div>
        <div class="flex items-center gap-2">
          <UIcon v-if="icon" :name="icon" class="size-5" />
          <h1 class="text-2xl font-bold">{{ title }}</h1>
        </div>
        <p v-if="description" class="text-sm leading-4 text-neutral-400">{{ description }}</p>
      </div>

      <slot name="actions" />
    </header>

    <slot />
  </section>
</template>
