import { afterAll, describe, expect, test } from 'vitest'
import userTest from '#tests/utils/user'
import { request } from '#tests/setup'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@me.forja.test')
})

const getMe = async (headers?: Record<string, string>) => {
  const { status, data } = await request('v1/auth/me', {
    method: 'GET',
    headers
  })
  return { status, data }
}

const createValidToken = async (email: string) => {
  const payload = {
    email,
    password: 'ValidPass123!'
  }

  const userCreated = await userTest.register(payload.email, payload.password)
  expect(userCreated).toBe(true)

  const { status, data } = await request('v1/auth/login-jwt', {
    method: 'POST',
    body: payload
  })

  expect(status).toBe(200)
  return data.token
}

const createValidSession = async (email: string) => {
  const payload = {
    email,
    password: 'ValidPass123!'
  }

  const userCreated = await userTest.register(payload.email, payload.password)
  expect(userCreated).toBe(true)

  const { status, headers } = await request('v1/auth/login', {
    method: 'POST',
    body: payload
  })

  expect(status).toBe(204)

  const sessionCookie = headers.get('Set-Cookie')
  expect(sessionCookie).toBeDefined()
  expect(sessionCookie).toContain('nuxt-session')

  if (!sessionCookie) {
    throw new Error('Session cookie not found')
  }

  return sessionCookie
}

describe('GET /api/v1/auth/me', () => {
  describe('Successful authentication with JWT token', () => {
    test('should return user data with valid JWT token', async () => {
      const email = 'valid.token@me.forja.test'
      const token = await createValidToken(email)

      const { status, data } = await getMe({
        Authorization: `Bearer ${token}`
      })

      expect(status).toBe(200)
      expect(data).toBeDefined()
      expect(data.name).toBe('Test User')
      expect(data.email).toBe(email)
      expect(data.password).toBeUndefined()
      expect(data).not.toHaveProperty('password')
    })

    test('should return user data with valid JWT token in different case', async () => {
      const email = 'valid.token.case@me.forja.test'
      const token = await createValidToken(email)

      const { status, data } = await getMe({
        authorization: `bearer ${token}`
      })

      expect(status).toBe(200)
      expect(data).toBeDefined()
      expect(data.name).toBe('Test User')
      expect(data.email).toBe(email)
    })
  })

  describe('Successful authentication with session cookie', () => {
    test('should return user data with valid session cookie', async () => {
      const email = 'valid.session@me.forja.test'
      const sessionCookie = await createValidSession(email)

      const { status, data } = await getMe({
        Cookie: sessionCookie
      })

      expect(status).toBe(200)
      expect(data).toBeDefined()
      expect(data.name).toBe('Test User')
      expect(data.email).toBe(email)
      expect(data.password).toBeUndefined()
      expect(data).not.toHaveProperty('password')
    })

    test('should return user data with session cookie in different case', async () => {
      const email = 'valid.session.case@me.forja.test'
      const sessionCookie = await createValidSession(email)

      const { status, data } = await getMe({
        cookie: sessionCookie
      })

      expect(status).toBe(200)
      expect(data).toBeDefined()
      expect(data.name).toBe('Test User')
      expect(data.email).toBe(email)
    })

    test('should prioritize session over JWT when both are present', async () => {
      const sessionEmail = 'session.priority@me.forja.test'
      const jwtEmail = 'jwt.priority@me.forja.test'

      const sessionCookie = await createValidSession(sessionEmail)
      const jwtToken = await createValidToken(jwtEmail)

      const { status, data } = await getMe({
        Cookie: sessionCookie,
        Authorization: `Bearer ${jwtToken}`
      })

      expect(status).toBe(200)
      expect(data).toBeDefined()
      expect(data.email).toBe(sessionEmail) // Session should take priority
      expect(data.name).toBe('Test User')
    })
  })

  describe('Authentication failures', () => {
    test('should reject request without Authorization header or session cookie', async () => {
      const { status, data } = await getMe()

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with empty Authorization header', async () => {
      const { status, data } = await getMe({
        Authorization: ''
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with malformed Authorization header', async () => {
      const { status, data } = await getMe({
        Authorization: 'InvalidFormat'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with Bearer prefix but no token', async () => {
      const { status, data } = await getMe({
        Authorization: 'Bearer '
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with invalid JWT token', async () => {
      const { status, data } = await getMe({
        Authorization: 'Bearer invalid.jwt.token'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with invalid session cookie', async () => {
      const { status, data } = await getMe({
        Cookie: 'nuxt-session=invalid-session-data'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with empty session cookie', async () => {
      const { status, data } = await getMe({
        Cookie: 'nuxt-session='
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject request with malformed session cookie', async () => {
      const { status, data } = await getMe({
        Cookie: 'invalid-cookie-format'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })
  })

  describe('User validation', () => {
    test('should reject when user no longer exists in database', async () => {
      const email = 'deleted.user@me.forja.test'
      const sessionCookie = await createValidSession(email)

      // Delete the user from database
      await userTest.deleteLikedEmails(email)

      const { status, data } = await getMe({
        Cookie: sessionCookie
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })

    test('should reject when user no longer exists in database (JWT)', async () => {
      const email = 'deleted.user.jwt@me.forja.test'
      const token = await createValidToken(email)

      // Delete the user from database
      await userTest.deleteLikedEmails(email)

      const { status, data } = await getMe({
        Authorization: `Bearer ${token}`
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Acesso não autorizado')
    })
  })
})
