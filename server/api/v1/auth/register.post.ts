import type { H3Event } from 'h3'
import user from '#server/models/user'
import { RegisterUserSchema } from '#server/utils/validations/auth'
import { createErrorValidation } from '#server/utils/error'

export default defineEventHandler(async (event: H3Event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    RegisterUserSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  await user.createUsingPassword(data)

  setResponseStatus(event, 201)
})
