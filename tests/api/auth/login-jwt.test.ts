import { afterAll, describe, expect, test } from 'vitest'
import { useAuth } from '#server/utils/auth'
import userTest from '#tests/utils/user'
import { request } from '#tests/setup'
import * as jose from 'jose'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@login-jwt.forja.test')
})

interface LoginJWTPayload {
  email?: string
  password?: string
}

const loginUserJWT = async (payload: LoginJWTPayload) => {
  const { status, data, headers } = await request('v1/auth/login-jwt', {
    method: 'POST',
    body: payload
  })
  return { status, data, headers }
}

describe('POST /api/v1/auth/login-jwt', () => {
  test('should login with valid credentials and return JWT token', async () => {
    const payload = {
      email: 'valid.jwt.login@login-jwt.forja.test',
      password: 'ValidPass123!'
    }

    const userCreated = await userTest.register(payload.email, payload.password)
    expect(userCreated).toBe(true)

    const { status, data } = await loginUserJWT(payload)

    // Valide JWT Token
    expect(status).toBe(200)
    expect(data).toBeDefined()
    expect(data.token).toBeDefined()
    expect(typeof data.token).toBe('string')
    expect(data.token.length).toBeGreaterThan(0)
    expect(data.token_exp).toBeDefined()
    expect(data.token_refresh).toBeDefined()
    expect(data.token_refresh_exp).toBeDefined()

    const decodedToken = await useAuth().verifyJWTToken(data.token)
    expect(decodedToken).not.toBeNull()
    expect(decodedToken.name).toBe('Test User')
    expect(decodedToken.email).toBe(payload.email)
    expect(decodedToken.exp).toBeDefined()

    // Valide User Data
    expect(data.user).toBeDefined()
    expect(data.user.name).toBe('Test User')
    expect(data.user.email).toBe(payload.email)
    expect(data.user.password).toBeUndefined()
    expect(data.user).not.toHaveProperty('password')
  })

  describe('Data validation', () => {
    test('should reject payload without password', async () => {
      const payload = {
        email: 'without.password.jwt@login-jwt.forja.test'
      }
      const { status, data } = await loginUserJWT(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
    })

    test('should reject payload without email', async () => {
      const payload = {
        password: 'Abcdef123!'
      }
      const { status, data } = await loginUserJWT(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject invalid email format', async () => {
      const payload = {
        email: 'invalid.email',
        password: 'Abcdef123!'
      }
      const { status, data } = await loginUserJWT(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })

  describe('Authentication validation', () => {
    test('should reject login with non-existent email', async () => {
      const payload = {
        email: 'nonexistent.jwt@login-jwt.forja.test',
        password: 'Abcdef123!'
      }

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
      expect(data.token).toBeUndefined()
    })

    test('should reject login with wrong password', async () => {
      const email = 'wrong.password.jwt@login-jwt.forja.test'
      const correctPassword = 'CorrectPass123!'
      const wrongPassword = 'WrongPass123!'

      const userCreated = await userTest.register(email, correctPassword)
      expect(userCreated).toBe(true)

      const payload = {
        email,
        password: wrongPassword
      }

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
      expect(data.token).toBeUndefined()
    })

    test('should reject login with empty password', async () => {
      const email = 'empty.password.jwt@login-jwt.forja.test'
      const password = 'ValidPass123!'

      const userCreated = await userTest.register(email, password)
      expect(userCreated).toBe(true)

      const payload = {
        email,
        password: ''
      }

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Credenciais inválidas')
      expect(data.token).toBeUndefined()
    })

    test('should reject login with empty email', async () => {
      const payload = {
        email: '',
        password: 'ValidPass123!'
      }

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })

  describe('JWT Token validation', () => {
    test('should return token with correct expiration time', async () => {
      const payload = {
        email: 'expiration.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await userTest.register(payload.email, payload.password)
      expect(userCreated).toBe(true)

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      const decodedToken = await useAuth().verifyJWTToken(data.token)
      expect(decodedToken).not.toBeNull()

      const tokenExp = new Date(decodedToken.exp * 1000)
      const expectedExp = new Date(Date.now() + 60 * 15 * 1000)
      expectedExp.setMilliseconds(0)
      expect(tokenExp).toEqual(expectedExp)

      const decodedRefreshToken = await useAuth().verifyJWTToken(data.token_refresh)
      expect(decodedRefreshToken).not.toBeNull()

      const tokenExpRefresh = new Date(decodedRefreshToken.exp * 1000)
      const expectedExpRefresh = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
      expectedExpRefresh.setMilliseconds(0)
      expect(tokenExpRefresh).toEqual(expectedExpRefresh)
    })

    test('should return different tokens for different users', async () => {
      const user1 = {
        email: 'user1.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const user2 = {
        email: 'user2.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      await userTest.register(user1.email, user1.password)
      await userTest.register(user2.email, user2.password)

      const { data: data1 } = await loginUserJWT(user1)
      const { data: data2 } = await loginUserJWT(user2)

      expect(data1.token).not.toBe(data2.token)

      const decoded1 = await useAuth().verifyJWTToken(data1.token)
      const decoded2 = await useAuth().verifyJWTToken(data2.token)

      expect(decoded1?.email).toBe(user1.email)
      expect(decoded2?.email).toBe(user2.email)
    })

    test('should return token with proper JWT structure', async () => {
      const payload = {
        email: 'structure.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await userTest.register(payload.email, payload.password)
      expect(userCreated).toBe(true)

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Check if the token has a valid JWT structure (3 parts separated by dot)
      const parts = data.token.split('.')
      expect(parts.length).toBe(3)
    })
  })

  describe('Security validation', () => {
    test('should return token that can be verified with correct secret', async () => {
      const payload = {
        email: 'secret.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await userTest.register(payload.email, payload.password)
      expect(userCreated).toBe(true)

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Check if the token can be verified with the correct secret
      const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')
      const { payload: verifiedPayload } = await jose.jwtVerify(data.token, secret)
      expect(verifiedPayload).toBeDefined()
    })

    test('should reject token verification with wrong secret', async () => {
      const payload = {
        email: 'wrong.secret.jwt@login-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await userTest.register(payload.email, payload.password)
      expect(userCreated).toBe(true)

      const { status, data } = await loginUserJWT(payload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Try to verify with wrong secret should fail
      const wrongSecret = Buffer.from('!wrong-secret!', 'utf-8')
      await expect(jose.jwtVerify(data.token, wrongSecret)).rejects.toThrow()
    })
  })
})
