import { users, type InsertUser, type User } from '#server/database/schemas/users'
import { createErrorValidation } from '#server/utils/error'
import { useDB } from '#server/utils/database'
import { eq } from 'drizzle-orm'
import * as jose from 'jose'

interface UserLogin {
  id: string
  name: string
  email: string
  exp?: number
}

const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')

const createUsingPassword = async (user: InsertUser): Promise<User | null> => {
  await valideUniqueEmail(user.email)
  await validateStrongPassword(user.password!)

  const hashedPassword = await createHashPassword(user.password!)

  const newUserData = {
    ...user,
    password: hashedPassword
  }

  const [newUser] = await useDB().insert(users).values(newUserData).returning()

  return newUser
}

const loginWithPassword = async (email: string, password: string): Promise<User | null> => {
  const [user] = await useDB().select().from(users).where(eq(users.email, email))

  if (!user) {
    throw createError({ statusCode: 401, message: 'Usuário não encontrado' })
  }

  if (!user.password) {
    throw createError({ statusCode: 401, message: 'Usuário não possui senha cadastrada' })
  }

  const isPasswordValid = await verifyHashPassword(password, user.password)

  if (!isPasswordValid) {
    throw createError({ statusCode: 401, message: 'Senha incorreta' })
  }

  return user
}

const valideUniqueEmail = async (email: string): Promise<void> => {
  let user: User[] = []

  try {
    user = await useDB().select().from(users).where(eq(users.email, email))
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro interno ao validar e-mail' })
  }

  if (user.length > 0) {
    throw createError({ statusCode: 400, message: 'O e-mail informado já está em uso' })
  }
}

const validateStrongPassword = async (password: string): Promise<void> => {
  if (password.length < 8) {
    throw createErrorValidation('A senha deve ter pelo menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    throw createErrorValidation('A senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    throw createErrorValidation('A senha deve conter pelo menos uma letra minúscula')
  }

  if (!/[0-9]/.test(password)) {
    throw createErrorValidation('A senha deve conter pelo menos um número')
  }

  if (!/[!@#$%^&*]/.test(password)) {
    throw createErrorValidation('A senha deve conter pelo menos um caractere especial')
  }
}

const transformToLogin = (user: User): UserLogin => {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  }
}

export const generateJWTToken = async (user: User): Promise<string> => {
  const payload = transformToLogin(user)

  const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1 week')
    .sign(secret)

  return token
}

export const verifyJWTToken = async (token: string): Promise<UserLogin | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as unknown as UserLogin
  } catch (error) {
    console.error(error)
    return null
  }
}

export default {
  createUsingPassword,
  loginWithPassword,
  transformToLogin,
  generateJWTToken,
  verifyJWTToken
}
