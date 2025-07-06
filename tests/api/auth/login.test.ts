import { afterAll, describe, expect, test } from 'vitest'
import { request } from '#tests/setup'
import userTest from '#tests/utils/user'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@forja.test')
})
interface LoginPayload {
  email?: string
  password?: string
}

const loginUser = async (payload: LoginPayload) => {
  const { status, data, headers } = await request('v1/auth/login', {
    method: 'POST',
    body: payload
  })
  return { status, data, headers }
}

describe('POST /api/v1/auth/login', () => {
  test('should login with valid credentials', async () => {
    const payload = {
      email: 'valid.login@forja.test',
      password: 'ValidPass123!'
    }

    const userCreated = await userTest.register(payload.email, payload.password)
    expect(userCreated).toBe(true)

    const { status, data, headers } = await loginUser(payload)

    expect(status).toBe(204)
    expect(data).toBeUndefined()

    const sessionCookie = headers.get('Set-Cookie')

    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain(`nuxt-session`)
    expect(sessionCookie).toContain('HttpOnly;')
    expect(sessionCookie).toContain('Secure;')
  })

  describe('Data validation', () => {
    test('should reject payload without password', async () => {
      const payload = {
        email: 'without.password@forja.test'
      }
      const { status, data } = await loginUser(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
    })

    test('should reject payload without email', async () => {
      const payload = {
        password: 'Abcdef123!'
      }
      const { status, data } = await loginUser(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject invalid email format', async () => {
      const payload = {
        email: 'invalid.email',
        password: 'Abcdef123!'
      }
      const { status, data } = await loginUser(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })

  describe('Authentication validation', () => {
    test('should reject login with non-existent email', async () => {
      const payload = {
        email: 'nonexistent@forja.test',
        password: 'Abcdef123!'
      }

      const { status, data } = await loginUser(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
    })

    test('should reject login with wrong password', async () => {
      const email = 'wrong.password@forja.test'
      const correctPassword = 'CorrectPass123!'
      const wrongPassword = 'WrongPass123!'

      const userCreated = await userTest.register(email, correctPassword)
      expect(userCreated).toBe(true)

      const payload = {
        email,
        password: wrongPassword
      }

      const { status, data } = await loginUser(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
    })

    test('should reject login with empty password', async () => {
      const email = 'empty.password@forja.test'
      const password = 'ValidPass123!'

      const userCreated = await userTest.register(email, password)
      expect(userCreated).toBe(true)

      const payload = {
        email,
        password: ''
      }

      const { status, data } = await loginUser(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
    })

    test('should reject login with empty email', async () => {
      const payload = {
        email: '',
        password: 'ValidPass123!'
      }

      const { status, data } = await loginUser(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })
})
