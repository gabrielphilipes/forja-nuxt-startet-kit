<script setup lang="ts"></script>

<template>
  <div class="block mb-32">
    <div class="hidden md:block">
      <LayoutHeader />
    </div>

    <main class="w-10/12 max-w-sm mx-auto mt-12 md:mt-28">
      <div class="md:hidden -ml-4">
        <LayoutHeader />
      </div>

      <NuxtPage />
    </main>

    <ul
      class="flex items-center justify-center gap-4 mt-10 text-xs text-neutral-400 dark:text-neutral-500"
    >
      <li>
        <NuxtLink to="/termos-de-uso">Termos de Uso</NuxtLink>
      </li>

      <span class="text-xs text-neutral-400 dark:text-neutral-500">|</span>

      <li>
        <NuxtLink to="/política-de-privacidade">Política de Privacidade </NuxtLink>
      </li>
    </ul>
  </div>
</template>
