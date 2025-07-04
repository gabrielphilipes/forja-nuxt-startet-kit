import { afterAll, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import userTest from '#tests/utils/user'
import { request } from '#tests/setup'
import { eq } from 'drizzle-orm'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@forja.test')
})

interface RegisterPayload {
  name?: string
  email?: string
  password?: string
}

const registerUser = async (payload: RegisterPayload) => {
  const { status, data } = await request('v1/auth/register', {
    method: 'POST',
    body: payload,
    ignoreResponseError: true
  })
  return { status, data }
}

describe('POST /api/v1/auth/register', () => {
  test('Register a new user using password', async () => {
    const payload = {
      name: 'Gabriel Philipe',
      email: 'success.register@forja.test',
      password: 'Success123!'
    }

    const { status, data } = await registerUser(payload)
    expect(status).toBe(201)
    expect(data).toBe('')

    // Check in database
    const [user] = await useDB().select().from(users).where(eq(users.email, payload.email))
    expect(user).toBeDefined()
    expect(user?.email).toBe(payload.email)
    expect(user?.name).toBe(payload.name)
  })

  describe('Data validation', () => {
    test('should reject payload without password', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'without.password@forja.test'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
    })

    test('should reject payload without name', async () => {
      const payload = {
        email: 'without.name@forja.test',
        password: 'Abcdef@123.'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.name).toBeDefined()
    })

    test('should reject payload without email', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        password: 'Abcdef@123.'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject invalid email', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'invalid.email',
        password: 'Abcdef@123.'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })

  describe('Password validation', () => {
    test('should reject password with less than 8 characters', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'less.than.8.characters@forja.test',
        password: 'Abc@123'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve ter pelo menos 8 caracteres')
    })

    test('should reject password without uppercase letter', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'no.uppercase.letter@forja.test',
        password: 'abcdef123!'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos uma letra maiúscula')
    })

    test('should reject password without lowercase letter', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'no.lowercase.letter@forja.test',
        password: 'ABCDEF123!'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos uma letra minúscula')
    })

    test('should reject password without number', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'no.number@forja.test',
        password: 'Abcdefgh!'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos um número')
    })

    test('should reject password without special character', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'no.special.character@forja.test',
        password: 'Abcdef123'
      }

      const { status, data } = await registerUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos um caractere especial')
    })
  })

  describe('Business validation', () => {
    test('should reject email already in use', async () => {
      // Primeiro, registra um usuário
      const firstUser = {
        name: 'First User',
        email: 'duplicate.email@forja.test',
        password: 'Abcdef123!'
      }

      const { status: firstStatus } = await registerUser(firstUser)
      expect(firstStatus).toBe(201)

      // Tenta registrar outro usuário com o mesmo email
      const secondUser = {
        name: 'Second User',
        email: 'duplicate.email@forja.test',
        password: 'Xyzdef456!'
      }

      const { status: secondStatus, data } = await registerUser(secondUser)

      expect(secondStatus).toBe(400)
      expect(data.message).toBe('O e-mail informado já está em uso')
    })
  })
})
