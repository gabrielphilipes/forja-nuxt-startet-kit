<script setup lang="ts">
  defineProps<{
    text: string
    href: string
    id?: string
  }>()
</script>

<template>
  <table
    align="center"
    width="100%"
    border="0"
    cellpadding="0"
    cellspacing="0"
    role="presentation"
    style="max-width: 100%; text-align: left; margin-bottom: 15px"
  >
    <tbody>
      <tr style="width: 100%">
        <td>
          <a
            :id="id"
            :href="href"
            style="
              line-height: 100%;
              text-decoration: none;
              display: inline-block;
              max-width: 100%;
              mso-padding-alt: 0px;
              color: #ffffff;
              background-color: #000000;
              border-color: #000000;
              border-width: 2px;
              border-style: solid;
              font-size: 14px;
              font-weight: 500;
              border-radius: 9999px;
              padding: 12px 32px 12px 32px;
            "
            target="_blank"
          >
            <span
              ><!--[if mso
                ]><i style="mso-font-width: 400%; mso-text-raise: 18" hidden
                  >&#8202;&#8202;&#8202;&#8202;</i
                ><!
              [endif]--></span
            >
            <span
              style="
                max-width: 100%;
                display: inline-block;
                line-height: 120%;
                mso-padding-alt: 0px;
                mso-text-raise: 9px;
              "
              >{{ text }} →</span
            >
            <span
              ><!--[if mso
                ]><i style="mso-font-width: 400%" hidden>&#8202;&#8202;&#8202;&#8202;&#8203;</i><!
              [endif]--></span
            >
          </a>
        </td>
      </tr>
    </tbody>
  </table>
</template>
