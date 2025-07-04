<script setup lang="ts">
  import Button from '@/components/email/Button.vue'
  import Layout from '@/components/email/Layout.vue'
  import Text from '@/components/email/Text.vue'

  defineProps<{
    name: string
    recoveryUrl: string
  }>()
</script>

<template>
  <Layout title="Recuperação de senha">
    <Text
      :text="`Olá ${name}, recebemos uma solicitação para redefinir sua senha. Para criar uma nova senha, clique no botão abaixo:`"
    />
    <Button id="reset-password-button" text="Redefinir minha senha" :href="recoveryUrl" />
    <Text text="Se você não solicitou a recuperação de senha, por favor ignore este email." />
  </Layout>
</template>
