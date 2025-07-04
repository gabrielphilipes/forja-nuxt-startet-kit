<script setup lang="ts">
  defineProps<{
    text: string
  }>()
</script>

<template>
  <h2
    style="
      margin-left: 0px;
      margin-right: 0px;
      margin-top: 0px;
      margin-bottom: 12px;
      text-align: left;
      color: #111827;
      font-size: 30px;
      line-height: 36px;
      font-weight: 700;
    "
  >
    <strong>{{ text }}</strong>
  </h2>
</template>
