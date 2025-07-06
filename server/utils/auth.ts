import type { H3Event } from 'h3'
import userModel from '#server/models/user'

const validateAuth = async (event: H3Event): Promise<{ email: string }> => {
  try {
    const { user } = await requireUserSession(event)
    return user as { email: string }
  } catch {
    // Do nothing
  }

  const bearerToken = getHeader(event, 'Authorization')
  if (!bearerToken) {
    throw createError({ statusCode: 401, message: 'Bearer token não encontrado' })
  }

  try {
    const token = bearerToken.split(' ')[1]
    const decodedToken = await userModel.verifyJWTToken(token)
    return decodedToken
  } catch (error) {
    throw createError({ statusCode: 401, message: 'Verificação JWT inválida', cause: error })
  }
}

const requiredAuth = async (event: H3Event) => {
  let email: string = ''
  try {
    const data = await validateAuth(event)
    email = data.email
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Acesso não autorizado',
      cause: error
    })
  }

  const user = await userModel.findByEmail(email)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Acesso não autorizado'
    })
  }

  // TODO: Check more conditions to validate the user

  return userModel.transformToLogin(user)
}

export { requiredAuth }
