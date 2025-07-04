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
  const refreshToken = data.token
  const decodedRefreshToken = await user.verifyJWTToken(refreshToken)

  if (!decodedRefreshToken) {
    throw createError({ statusCode: 401, message: 'Token expirado ou inválido' })
  }

  // Check if the user still exists in the database
  const currentUser = await user.findByEmail(decodedRefreshToken.email)

  if (!currentUser) {
    throw createError({ statusCode: 401, message: 'Usuário não encontrado' })
  }

  const newToken = await user.generateJWTToken(currentUser)
  const newRefreshToken = await user.generateJWTTokenRefresh(currentUser)

  const userData = user.transformToLogin(currentUser)

  await user.invalidateJWTToken(refreshToken)

  return {
    token: newToken.token,
    token_exp: newToken.exp,
    token_refresh: newRefreshToken.token,
    token_refresh_exp: newRefreshToken.exp,
    user: userData
  }
})
