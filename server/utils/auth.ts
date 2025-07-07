import type { H3Event } from 'h3'
import userModel from '#server/models/user'
import type { User } from '#server/database/schemas/users'
import type { UserLogin } from '#server/models/user'
import * as jose from 'jose'

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
    const decodedToken = await useAuth().verifyJWTToken(token)
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

export const useAuth = () => {
  const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')

  const generateJWTToken = async (user: User): Promise<{ token: string; exp: number }> => {
    const payload = userModel.transformToLogin(user, 'access')

    const exp = new Date(Date.now() + 60 * 15 * 1000) // 15 minutes

    const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(exp)
      .sign(secret)

    return { token, exp: exp.getTime() }
  }

  const generateJWTTokenRefresh = async (user: User): Promise<{ token: string; exp: number }> => {
    const payload = userModel.transformToLogin(user, 'refresh')

    const exp = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000) // 7 days

    const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(exp)
      .sign(secret)

    return { token, exp: exp.getTime() }
  }

  const verifyJWTToken = async (token: string): Promise<UserLogin> => {
    const blacklist = ((await useStorage().getItem('jwt-blacklist')) as string[]) || []

    if (blacklist.includes(token)) {
      throw createError({ statusCode: 401, message: 'Token expirado ou inválido' })
    }

    try {
      const { payload } = await jose.jwtVerify(token, secret)
      return payload as unknown as UserLogin
    } catch (error) {
      console.error(error)
      throw createError({ statusCode: 401, message: 'Token expirado ou inválido', cause: error })
    }
  }

  const invalidateJWTToken = async (token: string): Promise<void> => {
    const blacklist = ((await useStorage().getItem('jwt-blacklist')) as string[]) || []
    blacklist.push(token)
    await useStorage().setItem('jwt-blacklist', blacklist)
  }

  return {
    generateJWTToken,
    generateJWTTokenRefresh,
    verifyJWTToken,
    invalidateJWTToken
  }
}
