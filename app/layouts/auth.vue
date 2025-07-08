<script setup lang="ts"></script>

<template>
  <div>
    <div class="hidden md:block">
      <LayoutHeader />
    </div>

    <main class="w-10/12 max-w-lg mx-auto mt-28">
      <div class="md:hidden -ml-4">
        <LayoutHeader />
      </div>

      <NuxtPage />
    </main>

    <ul
      class="flex items-center justify-center gap-4 mt-10 text-sm text-gray-400 dark:text-gray-500"
    >
      <li>
        <NuxtLink
          to="/termos-de-uso"
          class="underline hover:text-gray-700 dark:hover:text-gray-400"
        >
          Termos de Uso
        </NuxtLink>
      </li>

      <li>
        <NuxtLink
          to="/política-de-privacidade"
          class="underline hover:text-gray-700 dark:hover:text-gray-400"
        >
          Política de Privacidade
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
