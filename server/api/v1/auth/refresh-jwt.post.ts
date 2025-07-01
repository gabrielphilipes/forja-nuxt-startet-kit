import { RefreshJWTSchema } from '#server/utils/validations/auth'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    RefreshJWTSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  // Check if the token is valid
  const oldToken = data.token
  const decodedToken = await user.verifyJWTToken(oldToken)

  if (!decodedToken) {
    throw createError({ statusCode: 401, message: 'Token expirado ou inválido' })
  }

  // Check if the user still exists in the database
  const currentUser = await user.findByEmail(decodedToken.email)

  if (!currentUser) {
    throw createError({ statusCode: 401, message: 'Usuário não encontrado' })
  }

  const newToken = await user.generateJWTToken(currentUser)
  const userData = user.transformToLogin(currentUser)

  await user.invalidateJWTToken(oldToken)

  return {
    token: newToken,
    user: userData
  }
})
