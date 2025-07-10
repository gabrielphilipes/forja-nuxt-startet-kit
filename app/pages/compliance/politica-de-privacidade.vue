<script setup lang="ts">
  definePageMeta({ layout: 'external' })

  const nav = [
    {
      label: 'Termos de Uso',
      to: '/termos-de-uso'
    },
    {
      label: 'Política de Privacidade',
      to: '/politica-de-privacidade'
    }
  ]
</script>

<template>
  <LayoutExternalContent :nav="nav">
    <div class="prose prose-sm prose-neutral dark:prose-invert max-w-none mx-auto">
      <header class="flex flex-col">
        <h1 class="-mb-4">Política de Privacidade</h1>

        <p class="text-sm opacity-50">Última atualização: 15 de julho de 2025</p>
      </header>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ac sem quam. Maecenas
        lacinia, lorem vel sollicitudin auctor, est leo volutpat purus, nec tincidunt libero ligula
        id velit. Aenean ultrices viverra leo, sit amet posuere justo luctus a. Vestibulum pharetra
        enim ac fringilla efficitur. Aenean non sem at leo pellentesque accumsan. Nam fermentum
        laoreet sodales. Quisque pellentesque, mi ac rutrum placerat, tellus sem posuere ipsum, ac
        rutrum nisl magna laoreet libero. Cras in imperdiet quam. Suspendisse ac lacus a tellus
        dapibus congue. Cras porta ullamcorper urna, id ultrices leo pulvinar ullamcorper. In sit
        amet lorem orci.
      </p>

      <p>
        Sed et hendrerit dolor, quis congue nunc. Phasellus viverra purus neque, in viverra nibh
        auctor id. Maecenas feugiat faucibus magna. Nulla augue mi, pharetra vitae quam nec,
        fermentum hendrerit dui. Nulla fringilla sapien id scelerisque congue. Ut imperdiet ex diam,
        in facilisis libero blandit a. Nam quis vestibulum neque. Proin ultrices tellus eget
        porttitor commodo. Proin in viverra quam. Integer faucibus suscipit sem. Mauris faucibus
        elit at mi viverra pharetra. Maecenas ut fringilla odio, blandit vestibulum dolor. Donec vel
        enim metus.
      </p>

      <p>
        Cras nibh mi, blandit vel enim sit amet, ultrices malesuada massa. Aliquam venenatis tellus
        vel purus imperdiet placerat et vel metus. Donec pharetra ex ut orci cursus fermentum. Nulla
        quis enim est. Morbi condimentum porta justo, eget ornare ligula. Aliquam fringilla ac urna
        et finibus. Suspendisse commodo hendrerit eros id imperdiet. Integer hendrerit mauris in
        diam euismod, ultricies sodales arcu gravida. Aenean eleifend rutrum lectus, tincidunt
        eleifend nisl pharetra ut. Class aptent taciti sociosqu ad litora torquent per conubia
        nostra, per inceptos himenaeos. Proin ac odio nec orci pharetra efficitur vel sit amet ante.
        Praesent felis felis, pulvinar quis sodales non, consequat id nisi.
      </p>

      <p>
        Cras ac nisi nibh. Proin eleifend felis mauris, ac porttitor libero consequat non. Quisque
        quis neque mi. Maecenas vulputate, tellus facilisis scelerisque interdum, turpis velit
        lobortis nulla, at tempor ex ligula eget purus. Phasellus a magna sit amet neque tincidunt
        euismod id tincidunt nisi. Nulla ac auctor purus. Fusce vulputate posuere mauris nec
        commodo. Etiam cursus libero nec dolor luctus ultrices. Maecenas pulvinar velit lacus, non
        posuere leo placerat in. Mauris fringilla nibh id maximus convallis. Vestibulum tincidunt ex
        non augue posuere, vitae dictum augue pretium. Nam volutpat magna id felis varius blandit.
      </p>

      <p>
        In augue est, cursus sed maximus eu, cursus non diam. Praesent semper tempor justo, ac
        bibendum turpis pulvinar at. Morbi vitae elit auctor, dignissim tellus ut, vulputate quam.
        Fusce vestibulum condimentum nisi at pellentesque. Mauris odio arcu, venenatis ac mi eget,
        iaculis dictum turpis. Aenean blandit, enim nec finibus porta, dolor elit varius arcu, et
        dignissim metus eros at mi. Vestibulum ullamcorper justo sit amet viverra eleifend.
        Pellentesque venenatis mollis neque id vehicula. Praesent bibendum accumsan dictum. Sed ac
        felis a lacus ultrices condimentum vel vel velit. Proin elit nibh, vehicula ac neque id,
        ornare cursus tellus. Vivamus scelerisque lobortis sem, consectetur efficitur diam viverra
        nec. Aliquam blandit sollicitudin felis, non aliquam lacus euismod sed. Sed vel felis in leo
        porta ullamcorper. Maecenas scelerisque, libero id commodo vehicula, nulla mauris accumsan
        massa, malesuada vestibulum ipsum urna eu dolor. Praesent scelerisque volutpat magna.
      </p>
    </div>
  </LayoutExternalContent>
</template>
