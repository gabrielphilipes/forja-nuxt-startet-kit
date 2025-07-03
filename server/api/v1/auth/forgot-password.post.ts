import { ForgotPasswordSchema } from '#server/utils/validations/auth'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    ForgotPasswordSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  const { email } = data

  const userToResetPassword = await user.findByEmail(email)

  if (!userToResetPassword) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setResponseStatus(event, 200)
    return
  }

  user.resetPassword(userToResetPassword)

  setResponseStatus(event, 200)
})
