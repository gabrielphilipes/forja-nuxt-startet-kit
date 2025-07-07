import { users, type InsertUser, type User } from '#server/database/schemas/users'
import { createErrorValidation } from '#server/utils/error'
import { useDB } from '#server/utils/database'
import RecoveryPassword from '@/emails/RecoveryPassword.vue'
import { render } from '@vue-email/render'
import { eq } from 'drizzle-orm'
import oauth from './oauth'

export interface UserLogin {
  name: string
  email: string
  type?: 'access' | 'refresh'
  exp?: number
}

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

const createUsingOAuth = async (
  user: Omit<
    InsertUser,
    'id' | 'password' | 'email_verified_at' | 'created_at' | 'updated_at' | 'last_activity'
  >
): Promise<User> => {
  await valideUniqueEmail(user.email)

  try {
    const newUserData = user
    newUserData.email = newUserData.email.toLowerCase() // Ensure email is always lowercase

    const [newUser] = await useDB().insert(users).values(newUserData).returning()

    return newUser
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro interno ao criar usuário' })
  }
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

const findByEmail = async (email: string): Promise<User | null> => {
  try {
    const [user] = await useDB().select().from(users).where(eq(users.email, email))
    return user
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro interno ao buscar usuário' })
  }
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

const transformToLogin = (user: User | InsertUser, type?: 'access' | 'refresh'): UserLogin => {
  return {
    name: user.name,
    email: user.email,
    type
  }
}

const forgotPassword = async (user: User, exp: number = 60 * 60 * 1): Promise<void> => {
  // Check is oauth user
  const userOAuth = await oauth.findByUserId(user.id)
  if (userOAuth && userOAuth.length > 0 && !user.password) {
    throw createError({
      statusCode: 400,
      message: 'Usuário não pode trocar a senha, pois é apenas OAuth'
    })
  }

  /**
   * If exp is undefined or null, set it to 1 hour by default
   * Change the expiration time to valide in tests
   */
  if (exp === undefined || exp === null) {
    exp = 60 * 60 * 1
  }

  // Create token
  const tokenPayload = {
    email: user.email,
    exp: Math.floor(Date.now() / 1000 + exp) // 1 hour by default
  }

  const tokenToRecovery = encrypt(JSON.stringify(tokenPayload))
  const recoveryUrl = `${process.env.SITE_URL}/alterar-senha?token=${tokenToRecovery}`

  const emailContent = await render(RecoveryPassword, {
    name: user.name,
    recoveryUrl
  })

  await useEmail({
    toEmail: user.email,
    toName: user.name,
    subject: `Recupere sua senha ${user.name}`,
    html: emailContent
  })
}

const checkTokenToResetPassword = async (token: string): Promise<string> => {
  const tokenPayload = decrypt(token)
  const tokenPayloadJson = JSON.parse(tokenPayload)
  const { email, exp } = tokenPayloadJson

  const blacklist = ((await useStorage().getItem('reset-password-blacklist')) as string[]) || []

  if (exp < Date.now() / 1000 || blacklist.includes(token)) {
    throw createError({ statusCode: 401, message: 'Token expirado' })
  }

  // Add token to blacklist
  await useStorage().setItem('reset-password-blacklist', [...blacklist, token])

  return email
}

const changePassword = async (
  user: User,
  password: string,
  password_confirmation: string
): Promise<User> => {
  if (password !== password_confirmation) {
    throw createError({ statusCode: 400, message: 'As senhas não coincidem' })
  }

  await validateStrongPassword(password)

  const hashedPassword = await createHashPassword(password)
  const [updatedUser] = await useDB()
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id))
    .returning()

  return updatedUser
}

export default {
  createUsingPassword,
  loginWithPassword,
  transformToLogin,
  findByEmail,
  createUsingOAuth,
  forgotPassword,
  checkTokenToResetPassword,
  changePassword
}
