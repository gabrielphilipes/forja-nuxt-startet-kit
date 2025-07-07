import { LoginUserSchema } from '#server/utils/validations/auth'
import type { User } from '#server/database/schemas/users'
import user from '#server/models/user'

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    LoginUserSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Ajuste os dados enviados e tente novamente', error)
  }

  let loginUser: User | null = null

  try {
    loginUser = await user.loginWithPassword(data.email, data.password)
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 401, message: 'Credenciais inválidas' })
  }

  if (!loginUser) {
    throw createError({ statusCode: 401, message: 'Credenciais inválidas' })
  }

  const token = await useAuth().generateJWTToken(loginUser)

  const refreshToken = await useAuth().generateJWTTokenRefresh(loginUser)

  const loginUserData = user.transformToLogin(loginUser)

  return {
    token: token.token,
    token_exp: token.exp,
    token_refresh: refreshToken.token,
    token_refresh_exp: refreshToken.exp,
    user: loginUserData
  }
})
