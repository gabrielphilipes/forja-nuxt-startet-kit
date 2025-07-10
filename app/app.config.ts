export default defineAppConfig({
  site_name: process.env.SITE_NAME || 'Forja',
  ui: {
    colors: {
      neutral: 'neutral'
    },
    button: {
      slots: {
        base: 'cursor-pointer rounded-xl no-underline'
      }
    },
    input: {
      slots: {
        base: 'rounded-xl'
      }
    },
    toast: {
      slots: {
        title: 'text-inherit',
        description: 'text-neutral-500',
        close: 'text-inherit hover:text-inherit hover:opacity-50'
      },
      variants: {
        color: {
          primary: {
            root: 'bg-primary-50 !text-primary-500',
            description: 'text-primary-400'
          },
          secondary: {
            root: 'bg-secondary-50 !text-secondary-500',
            description: 'text-secondary-400'
          },
          success: {
            root: 'bg-green-50 !text-green-500',
            description: 'text-green-400'
          },
          info: {
            root: 'bg-blue-50 !text-blue-500',
            description: 'text-blue-400'
          },
          warning: {
            root: 'bg-yellow-50 !text-yellow-500',
            description: 'text-yellow-400'
          },
          error: {
            root: 'bg-red-50 !text-red-500',
            description: 'text-red-400'
          }
        }
      }
    }
  }
})
