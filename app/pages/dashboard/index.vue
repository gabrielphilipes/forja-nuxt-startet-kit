<script setup lang="ts">
  definePageMeta({ middleware: 'app', layout: 'default' })
  useSeoMeta({ title: 'Painel de controle' })
</script>

<template>
  <LayoutDefaultContent
    title="Dashboard"
    description="Painel de controle do sistema"
    icon="i-heroicons-home"
  >
    <template #actions>
      <UButton>
        <UIcon name="i-heroicons-plus" class="size-5" />
        <span>Novo</span>
      </UButton>
    </template>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-5">
      <DashboardSummaryCard title="Usuários" value="100" :percentage="10" />
      <DashboardSummaryCard title="Usuários" value="100" :percentage="10" />
      <DashboardSummaryCard title="Usuários" value="100" :percentage="10" />
      <DashboardSummaryCard title="Usuários" value="100" :percentage="10" />
    </div>

    <DashboardTable />
  </LayoutDefaultContent>
</template>
