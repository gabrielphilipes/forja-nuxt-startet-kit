<script setup lang="ts">
  const siteName = useRuntimeConfig().public.site_name

  // Mobile nav
  const openMobileNav = ref<boolean>(false)
  const closeMobileNav = () => {
    openMobileNav.value = false
  }
</script>

<template>
  <main class="flex w-full h-full">
    <!-- Start: desktop nav -->
    <div class="hidden md:block fixed top-0 left-2 h-full w-full max-w-[250px] py-2">
      <section
        class="flex flex-col w-full h-full rounded-md bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-950 shadow-xl shadow-neutral-100 dark:shadow-neutral-950"
      >
        <LayoutDefaultNav />
      </section>
    </div>
    <!-- End: desktop nav -->

    <!-- Start: mobile nav -->
    <div
      class="md:hidden fixed top-0 left-0 w-full py-2 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-950 z-50"
    >
      <div class="flex items-center justify-between w-11/12 mx-auto">
        <ULink to="/" class="w-18">
          <img
            src="/assets/images/logo.svg"
            :alt="siteName"
            :title="siteName"
            class="dark:invert"
          />
        </ULink>

        <USlideover v-model:open="openMobileNav">
          <UButton color="neutral" variant="ghost" size="sm" icon="game-icons:hamburger-menu" />

          <template #content>
            <div class="size-full flex flex-col">
              <LayoutDefaultNav show-close-button @close="closeMobileNav" />
            </div>
          </template>
        </USlideover>
      </div>
    </div>
    <!-- End: mobile nav -->

    <section class="flex flex-col w-11/12 md:w-full mx-auto md:ml-[280px] pt-2">
      <div class="flex-1 max-w-7xl">
        <NuxtPage />
      </div>

      <footer class="pt-5 pb-3 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <USeparator />

        <div
          class="flex flex-col md:flex-row items-center justify-between max-w-7xl mt-5 text-xs text-neutral-500 md:mr-3"
        >
          <p>&copy; {{ new Date().getFullYear() }} {{ siteName }}. Todos os direitos reservados.</p>

          <UNavigationMenu
            :items="[
              { label: 'Termos de uso', to: '/termos-de-uso', target: '_blank' },
              { label: 'Política de privacidade', to: '/politica-de-privacidade', target: '_blank' }
            ]"
            :ui="{ linkLabel: 'text-xs' }"
          />
        </div>
      </footer>
    </section>
  </main>
</template>
