<script setup lang="ts">
  defineProps<{
    disabledButtons?: boolean
  }>()
</script>

<template>
  <UButton variant="outline" color="neutral" class="w-full" :disabled="disabledButtons">
    <Icon name="logos:github-icon" class="dark:invert" />
    Continuar com o GitHub
  </UButton>

  <UButton variant="outline" color="neutral" class="w-full" :disabled="disabledButtons">
    <Icon name="logos:facebook" />
    Continuar com o Facebook
  </UButton>

  <UButton variant="outline" color="neutral" class="w-full" :disabled="disabledButtons">
    <Icon name="devicon:google" />
    Continuar com o Google
  </UButton>

  <UButton variant="outline" color="neutral" class="w-full" :disabled="disabledButtons">
    <Icon name="devicon:apple" class="dark:invert" />
    Continuar com a Apple
  </UButton>
</template>
