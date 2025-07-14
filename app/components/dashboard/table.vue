<script setup lang="ts">
  import { h, resolveComponent } from 'vue'
  import type { TableColumn } from '@nuxt/ui'
  import type { Row } from '@tanstack/vue-table'
  import { useClipboard } from '@vueuse/core'

  const UButton = resolveComponent('UButton')
  const UBadge = resolveComponent('UBadge')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const toast = useToast()
  const { copy } = useClipboard()

  type Payment = {
    id: string
    date: string
    status: 'pago' | 'falho' | 'reembolso'
    email: string
    amount: number
  }

  const data = ref<Payment[]>([
    {
      id: '4620',
      date: '2024-03-12T16:30:00',
      status: 'pago',
      email: 'joao.silva@exemplo.com.br',
      amount: 594.9
    },
    {
      id: '4619',
      date: '2024-03-12T15:45:00',
      status: 'pago',
      email: 'maria.santos@exemplo.com.br',
      amount: 299.99
    },
    {
      id: '4618',
      date: '2024-03-12T14:20:00',
      status: 'falho',
      email: 'pedro.oliveira@exemplo.com.br',
      amount: 149.9
    },
    {
      id: '4617',
      date: '2024-03-12T13:15:00',
      status: 'pago',
      email: 'ana.rodrigues@exemplo.com.br',
      amount: 799.0
    },
    {
      id: '4616',
      date: '2024-03-12T11:30:00',
      status: 'reembolso',
      email: 'carlos.ferreira@exemplo.com.br',
      amount: 459.9
    },
    {
      id: '4615',
      date: '2024-03-12T10:45:00',
      status: 'pago',
      email: 'julia.costa@exemplo.com.br',
      amount: 279.9
    },
    {
      id: '4614',
      date: '2024-03-12T09:20:00',
      status: 'falho',
      email: 'lucas.almeida@exemplo.com.br',
      amount: 189.9
    },
    {
      id: '4613',
      date: '2024-03-11T18:50:00',
      status: 'pago',
      email: 'beatriz.lima@exemplo.com.br',
      amount: 649.9
    },
    {
      id: '4612',
      date: '2024-03-11T17:30:00',
      status: 'pago',
      email: 'rafael.pereira@exemplo.com.br',
      amount: 399.9
    },
    {
      id: '4611',
      date: '2024-03-11T16:15:00',
      status: 'reembolso',
      email: 'amanda.souza@exemplo.com.br',
      amount: 229.9
    },
    {
      id: '4610',
      date: '2024-03-11T15:40:00',
      status: 'pago',
      email: 'gabriel.martins@exemplo.com.br',
      amount: 559.9
    },
    {
      id: '4609',
      date: '2024-03-11T14:25:00',
      status: 'falho',
      email: 'isabela.santos@exemplo.com.br',
      amount: 179.9
    },
    {
      id: '4608',
      date: '2024-03-11T13:10:00',
      status: 'pago',
      email: 'thiago.oliveira@exemplo.com.br',
      amount: 729.9
    },
    {
      id: '4607',
      date: '2024-03-11T11:55:00',
      status: 'pago',
      email: 'larissa.costa@exemplo.com.br',
      amount: 319.9
    },
    {
      id: '4606',
      date: '2024-03-11T10:30:00',
      status: 'reembolso',
      email: 'bruno.silva@exemplo.com.br',
      amount: 449.9
    },
    {
      id: '4605',
      date: '2024-03-11T09:15:00',
      status: 'pago',
      email: 'camila.ferreira@exemplo.com.br',
      amount: 269.9
    },
    {
      id: '4604',
      date: '2024-03-10T19:40:00',
      status: 'falho',
      email: 'diego.almeida@exemplo.com.br',
      amount: 159.9
    },
    {
      id: '4603',
      date: '2024-03-10T18:25:00',
      status: 'pago',
      email: 'fernanda.lima@exemplo.com.br',
      amount: 619.9
    },
    {
      id: '4602',
      date: '2024-03-10T17:10:00',
      status: 'pago',
      email: 'gustavo.pereira@exemplo.com.br',
      amount: 389.9
    },
    {
      id: '4601',
      date: '2024-03-10T15:55:00',
      status: 'reembolso',
      email: 'helena.souza@exemplo.com.br',
      amount: 209.9
    }
  ])

  const columns: TableColumn<Payment>[] = [
    {
      accessorKey: 'id',
      header: '#',
      cell: ({ row }) => `#${row.getValue('id')}`
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => {
        return new Date(row.getValue('date')).toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const color = {
          pago: 'success' as const,
          falho: 'error' as const,
          reembolso: 'neutral' as const
        }[row.getValue('status') as string]

        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
          row.getValue('status')
        )
      }
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'amount',
      header: () => h('div', { class: 'text-right' }, 'Valor'),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue('amount'))

        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(amount)

        return h('div', { class: 'text-right font-medium' }, formatted)
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: {
                align: 'end'
              },
              items: getRowItems(row),
              'aria-label': 'Actions dropdown'
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto',
                'aria-label': 'Actions dropdown'
              })
          )
        )
      }
    }
  ]

  function getRowItems(row: Row<Payment>) {
    return [
      {
        type: 'label',
        label: 'Ações'
      },
      {
        label: 'Copiar ID',
        onSelect() {
          copy(row.original.id)

          toast.add({
            title: 'ID copiado para a área de transferência!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Ver cliente'
      },
      {
        label: 'Ver detalhes do pagamento'
      }
    ]
  }
</script>

<template>
  <div class="flex flex-col gap-2">
    <span class="text-sm text-neutral-500 font-medium">Últimas transações</span>

    <UCard variant="subtle" :ui="{ body: '!p-0' }">
      <UTable :data="data" :columns="columns" class="flex-1" :ui="{ td: '!py-2' }" />
    </UCard>
  </div>
</template>
