<script setup lang="ts">
  const props = defineProps<{
    title: string
    value: string
    percentage?: number
  }>()

  const percentageColor = computed(() => {
    if (!props.percentage || props.percentage === 0) return 'text-neutral-400'

    return props.percentage > 0 ? 'text-green-500' : 'text-red-500'
  })

  const percentageIcon = computed(() => {
    if (!props.percentage || props.percentage === 0) return 'ic:baseline-horizontal-rule'

    return props.percentage > 0
      ? 'material-symbols:arrow-upward'
      : 'material-symbols:arrow-downward'
  })
</script>

<template>
  <UCard variant="subtle" :ui="{ header: 'p-1', body: '!py-2' }">
    <template #header>
      <span class="text-sm">{{ title }}</span>
    </template>

    <div class="flex items-baseline gap-2">
      <span class="text-4xl font-bold leading-none">{{ value }}</span>

      <div v-if="percentage" class="flex items-center gap-0.5">
        <UIcon :name="percentageIcon" class="size-3" :class="percentageColor" />
        <span class="text-xs" :class="percentageColor"> {{ percentage }}% </span>
      </div>
    </div>
  </UCard>
</template>
