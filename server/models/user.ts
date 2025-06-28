import { eq } from 'drizzle-orm'
import { users, type InsertUser, type User } from '../database/schemas/users'
import { useDB } from '../utils/database'
import { createErrorValidation } from '../utils/error'

const createUsingPassword = async (user: InsertUser): Promise<User | null> => {
  await valideUniqueEmail(user.email)
  await validateStrongPassword(user.password!)

  const [newUser] = await useDB().insert(users).values(user).returning()

  return newUser
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

export default {
  createUsingPassword
}
