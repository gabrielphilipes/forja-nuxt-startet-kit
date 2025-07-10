<script setup lang="ts">
  useSeoMeta({
    titleTemplate: `%s - ${useRuntimeConfig().public.site_name}`,
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    colorScheme: 'dark',

    applicationName: useRuntimeConfig().public.site_name,
    author: 'Gabriel Philipe Silva',
    creator: 'Gabriel Philipe Silva',
    robots: 'noindex, nofollow',
    referrer: 'no-referrer',

    // Open Graph
    ogTitle: useRuntimeConfig().public.site_name,
    ogDescription: useRuntimeConfig().public.site_description,
    ogImage: `${useRuntimeConfig().public.site_url}/og-image.png`,
    ogUrl: useRuntimeConfig().public.site_url,
    ogType: 'website',
    ogLocale: 'pt-BR',
    ogSiteName: useRuntimeConfig().public.site_name
  })
</script>

<template>
  <UApp :toaster="{ position: 'top-center' }">
    <NuxtLayout class="w-full min-h-screen">
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
