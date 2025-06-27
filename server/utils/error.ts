import type { ZodError } from 'zod'

export const createErrorValidation = (error: ZodError, message?: string) => {
  return createError({
    status: 400,
    statusMessage: 'Invalid payload',
    message: message ?? 'Ajuste os dados enviados e tente novamente',
    data: error.flatten().fieldErrors
  })
}
