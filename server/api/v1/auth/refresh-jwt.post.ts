import { RefreshJWTSchema } from '#server/utils/validations/auth'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    RefreshJWTSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  // Verificar se o token é válido
  const decodedToken = await user.verifyJWTToken(data.token)

  if (!decodedToken) {
    throw createError({ statusCode: 401, message: 'Token expirado ou inválido' })
  }

  // Verificar se o usuário ainda existe no banco de dados
  const currentUser = await user.findByEmail(decodedToken.email)

  if (!currentUser) {
    throw createError({ statusCode: 401, message: 'Usuário não encontrado' })
  }

  // Gerar novo token
  const newToken = await user.generateJWTToken(currentUser)

  // Transformar dados do usuário para resposta
  const userData = user.transformToLogin(currentUser)

  return {
    token: newToken,
    user: userData
  }
})
