import { ForgotPasswordSchema } from '#server/utils/validations/auth'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    ForgotPasswordSchema.safeParse(body)
  )

  const expirationTime = getQuery(event)?.expiration_time as number | undefined

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  const { email } = data

  const userToResetPassword = await user.findByEmail(email)

  if (!userToResetPassword) {
    /**
     * Simulates sending a password recovery email, for security reasons, thus preventing
     * the request speed from being used to discover whether the email exists or not.
     */
    await new Promise((resolve) => setTimeout(resolve, 500))
    return
  }

  await user.forgotPassword(userToResetPassword, expirationTime)
})
