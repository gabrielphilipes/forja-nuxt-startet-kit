import { ResetPasswordSchema } from '#server/utils/validations/auth'
import type { User } from '#server/database/schemas/users'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    ResetPasswordSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  const { token, password, password_confirmation } = data

  let userToResetPassword: User | null = null
  try {
    // Validate token
    const emailToResetPassword = await user.checkTokenToResetPassword(token)

    // Check if user exists
    userToResetPassword = await user.findByEmail(emailToResetPassword)
    if (!userToResetPassword) {
      throw createError({ statusCode: 404, message: 'Usuário não encontrado' })
    }
  } catch (error) {
    throw createError({ statusCode: 401, message: 'Token inválido ou expirado', cause: error })
  }

  // Validate and change password
  await user.changePassword(userToResetPassword, password, password_confirmation)
})
