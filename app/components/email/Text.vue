<script setup lang="ts">
  defineProps<{
    text: string
  }>()
</script>

<template>
  <p
    style="
      font-size: 15px;
      line-height: 26.25px;
      margin-bottom: 16px;
      margin-top: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #374151;
      margin: 0 0 20px 0;
    "
    v-html="text"
  />
</template>
