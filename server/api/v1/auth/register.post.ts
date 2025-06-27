import type { H3Event } from 'h3'
import user from '../../../models/user'
import { RegisterUserSchema } from '../../../utils/validations/auth'
import { createErrorValidation } from '~~/server/utils/error'

export default defineEventHandler(async (event: H3Event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    RegisterUserSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation(error)
  }

  await user.createUsingPassword(data)

  setResponseStatus(event, 201)
})
