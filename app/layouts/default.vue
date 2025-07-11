<script setup lang="ts">
  const siteName = useRuntimeConfig().public.site_name
</script>

<template>
  <main class="flex w-full h-full">
    <!-- Desktop nav -->
    <div class="hidden md:block fixed top-0 left-2 h-full w-full max-w-[250px] py-2">
      <section
        class="flex flex-col w-full h-full rounded-md bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-950 shadow-xl shadow-neutral-200 dark:shadow-neutral-950"
      >
        <LayoutDefaultNav />
      </section>
    </div>

    <!-- Mobile nav -->

    <section class="flex flex-col w-11/12 md:w-full mx-auto md:ml-[280px] pt-2">
      <div class="flex-1">
        <NuxtPage />
      </div>

      <footer class="pt-5 pb-3 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <USeparator />

        <div class="flex items-center justify-between mt-5 text-xs text-neutral-500">
          <p>&copy; {{ new Date().getFullYear() }} {{ siteName }}. Todos os direitos reservados.</p>

          <UNavigationMenu
            :items="[
              { label: 'Termos de uso', to: '/termos-de-uso' },
              { label: 'Política de privacidade', to: '/politica-de-privacidade' }
            ]"
            :ui="{ linkLabel: 'text-xs' }"
          />
        </div>
      </footer>
    </section>
  </main>
</template>
