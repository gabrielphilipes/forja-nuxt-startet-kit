import { eq } from 'drizzle-orm'
import { users, type User } from '../database/schemas/users'
import { useDB } from '../utils/database'

const createUsingPassword = async (user: User): Promise<User> => {
  await valideUniqueEmail(user.email)
  await validateStrongPassword(user.password!)

  const [newUser] = await useDB().insert(users).values(user).returning()

  return newUser
}

const valideUniqueEmail = async (email: string): Promise<void> => {
  try {
    const user = await useDB().select().from(users).where(eq(users.email, email))
    if (user.length > 0) {
      throw createError({ statusCode: 400, message: 'O e-mail informado já está em uso' })
    }
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro ao buscar usuário' })
  }
}

const validateStrongPassword = async (password: string): Promise<void> => {
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: 'A senha deve ter pelo menos 8 caracteres' })
  }

  if (!/[A-Z]/.test(password)) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve conter pelo menos uma letra maiúscula'
    })
  }

  if (!/[a-z]/.test(password)) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve conter pelo menos uma letra minúscula'
    })
  }

  if (!/[0-9]/.test(password)) {
    throw createError({ statusCode: 400, message: 'A senha deve conter pelo menos um número' })
  }

  if (!/[!@#$%^&*]/.test(password)) {
    throw createError({
      statusCode: 400,
      message: 'A senha deve conter pelo menos um caractere especial'
    })
  }
}

export default {
  createUsingPassword
}
