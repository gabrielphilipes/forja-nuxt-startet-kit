export default defineAppConfig({
  site_name: process.env.SITE_NAME || 'Forja',
  ui: {
    colors: {
      neutral: 'neutral'
    },
    button: {
      slots: {
        base: 'cursor-pointer rounded-xl'
      }
    },
    input: {
      slots: {
        base: 'rounded-xl'
      }
    }
  }
})
