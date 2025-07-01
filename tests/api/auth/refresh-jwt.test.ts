import { afterAll, beforeEach, afterEach, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import { request, clearTestStorage } from '#tests/setup'
import user from '#server/models/user'
import { like } from 'drizzle-orm'
import * as jose from 'jose'

afterAll(async () => {
  await useDB().delete(users).where(like(users.email, '%@refresh-jwt.forja.test'))
})

interface LoginJWTPayload {
  email?: string
  password?: string
}

interface RefreshJWTPayload {
  token?: string
}

const loginUserJWT = async (payload: LoginJWTPayload) => {
  const { status, data, headers } = await request('v1/auth/login-jwt', {
    method: 'POST',
    body: payload
  })
  return { status, data, headers }
}

const refreshJWT = async (payload: RefreshJWTPayload) => {
  const { status, data, headers } = await request('v1/auth/refresh-jwt', {
    method: 'POST',
    body: payload
  })
  return { status, data, headers }
}

const createTestUser = async (payload: LoginJWTPayload): Promise<boolean> => {
  const { status } = await request('v1/auth/register', {
    method: 'POST',
    body: {
      name: 'Test User',
      email: payload.email,
      password: payload.password
    }
  })

  return status === 201
}

describe('POST /api/v1/auth/refresh-jwt', () => {
  beforeEach(() => {
    clearTestStorage()
  })

  afterEach(() => {
    clearTestStorage()
  })

  test('should refresh JWT token with valid token', async () => {
    const loginPayload = {
      email: 'valid.refresh@refresh-jwt.forja.test',
      password: 'ValidPass123!'
    }

    const userCreated = await createTestUser(loginPayload)
    expect(userCreated).toBe(true)

    // Login to get the token
    const { status: loginStatus, data: loginData } = await loginUserJWT(loginPayload)
    expect(loginStatus).toBe(200)
    expect(loginData.token).toBeDefined()

    // Refresh the token
    const refreshPayload = { token: loginData.token }

    // Await 1 second to ensure the token is not identical to the original
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const { status, data } = await refreshJWT(refreshPayload)

    // Validate the response
    expect(status).toBe(200)
    expect(data).toBeDefined()
    expect(data.token).toBeDefined()
    expect(typeof data.token).toBe('string')
    expect(data.token.length).toBeGreaterThan(0)

    // The new token should be different from the original
    expect(data.token).not.toBe(loginData.token)

    // Validate the new token
    const decodedToken = await user.verifyJWTToken(data.token)
    expect(decodedToken).not.toBeNull()
    expect(decodedToken?.id).toBeDefined()
    expect(decodedToken?.name).toBe('Test User')
    expect(decodedToken?.email).toBe(loginPayload.email)
    expect(decodedToken?.exp).toBeDefined()

    // Validate User Data
    expect(data.user).toBeDefined()
    expect(data.user.id).toBeDefined()
    expect(data.user.name).toBe('Test User')
    expect(data.user.email).toBe(loginPayload.email)
    expect(data.user.password).toBeUndefined()
    expect(data.user).not.toHaveProperty('password')
  })

  describe('Data validation', () => {
    test('should reject payload without token', async () => {
      const payload = {}
      const { status, data } = await refreshJWT(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.token).toBeDefined()
    })

    test('should reject payload with empty token', async () => {
      const payload = { token: '' }
      const { status, data } = await refreshJWT(payload)
      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.token).toBeDefined()
    })

    test('should reject payload with invalid token format', async () => {
      const payload = { token: 'invalid-token-format' }
      const { status, data } = await refreshJWT(payload)
      expect(status).toBe(401)
      expect(data.message).toBe('Token expirado ou inválido')
    })
  })

  describe('Token validation', () => {
    test('should reject expired token', async () => {
      // Create an expired token manually
      const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')
      const expiredToken = await new jose.SignJWT({
        id: 'test-id',
        name: 'Test User',
        email: 'expired.token@refresh-jwt.forja.test'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1 second ago')
        .sign(secret)

      const payload = { token: expiredToken }

      const { status, data } = await refreshJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Token expirado ou inválido')
      expect(data.token).toBeUndefined()
    })

    test('should reject token with wrong signature', async () => {
      const loginPayload = {
        email: 'wrong.signature@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      // Modify the token to have an incorrect signature
      const parts = loginData.token.split('.')
      const tamperedToken = `${parts[0]}.${parts[1]}.tampered-signature`

      const payload = { token: tamperedToken }

      const { status, data } = await refreshJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Token expirado ou inválido')
      expect(data.token).toBeUndefined()
    })

    test('should reject token with invalid user data', async () => {
      // Create a token with invalid user data
      const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')
      const invalidToken = await new jose.SignJWT({
        id: 'non-existent-id',
        name: 'Invalid User',
        email: 'invalid.user@refresh-jwt.forja.test'
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1 week')
        .sign(secret)

      const payload = { token: invalidToken }

      const { status, data } = await refreshJWT(payload)

      expect(status).toBe(401)
      expect(data.message).toBe('Usuário não encontrado')
      expect(data.token).toBeUndefined()
    })
  })

  describe('JWT Token validation', () => {
    test('should return new token with correct expiration time', async () => {
      const loginPayload = {
        email: 'expiration.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      const refreshPayload = {
        token: loginData.token
      }

      const { status, data } = await refreshJWT(refreshPayload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      const decodedToken = await user.verifyJWTToken(data.token)
      expect(decodedToken).not.toBeNull()

      const currentTime = Math.floor(Date.now() / 1000)
      expect(decodedToken?.exp).toBeGreaterThan(currentTime)
    })

    test('should return different tokens for different users', async () => {
      const user1 = {
        email: 'user1.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const user2 = {
        email: 'user2.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      await createTestUser(user1)
      await createTestUser(user2)

      const { data: data1 } = await loginUserJWT(user1)
      const { data: data2 } = await loginUserJWT(user2)

      const refresh1 = await refreshJWT({ token: data1.token })
      const refresh2 = await refreshJWT({ token: data2.token })

      expect(refresh1.data.token).not.toBe(refresh2.data.token)

      const decoded1 = await user.verifyJWTToken(refresh1.data.token)
      const decoded2 = await user.verifyJWTToken(refresh2.data.token)

      expect(decoded1?.id).not.toBe(decoded2?.id)
      expect(decoded1?.email).toBe(user1.email)
      expect(decoded2?.email).toBe(user2.email)
    })

    test('should return token with proper JWT structure', async () => {
      const loginPayload = {
        email: 'structure.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      const refreshPayload = {
        token: loginData.token
      }

      const { status, data } = await refreshJWT(refreshPayload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Check if the token has a valid JWT structure (3 parts separated by dot)
      const parts = data.token.split('.')
      expect(parts.length).toBe(3)
    })
  })

  describe('Security validation', () => {
    test('should return token that can be verified with correct secret', async () => {
      const loginPayload = {
        email: 'secret.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      const refreshPayload = {
        token: loginData.token
      }

      const { status, data } = await refreshJWT(refreshPayload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Check if the token can be verified with the correct secret
      const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')
      const { payload: verifiedPayload } = await jose.jwtVerify(data.token, secret)
      expect(verifiedPayload).toBeDefined()
    })

    test('should reject token verification with wrong secret', async () => {
      const loginPayload = {
        email: 'wrong.secret.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      const refreshPayload = {
        token: loginData.token
      }

      const { status, data } = await refreshJWT(refreshPayload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()

      // Try to verify with wrong secret should fail
      const wrongSecret = Buffer.from('!wrong-secret!', 'utf-8')
      await expect(jose.jwtVerify(data.token, wrongSecret)).rejects.toThrow()
    })
  })

  describe('Business logic validation', () => {
    test('should invalidate old token after refresh', async () => {
      const loginPayload = {
        email: 'invalidate.refresh@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)
      const originalToken = loginData.token

      // Verificar que o token original é válido
      const originalDecoded = await user.verifyJWTToken(originalToken)
      expect(originalDecoded).not.toBeNull()
      expect(originalDecoded?.email).toBe(loginPayload.email)

      // Fazer refresh do token
      const refreshPayload = {
        token: originalToken
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      const { status, data } = await refreshJWT(refreshPayload)

      expect(status).toBe(200)
      expect(data.token).toBeDefined()
      expect(data.token).not.toBe(originalToken)

      // Verificar que o novo token é válido
      const newDecoded = await user.verifyJWTToken(data.token)
      expect(newDecoded).not.toBeNull()
      expect(newDecoded?.email).toBe(loginPayload.email)

      // Verificar que o token original foi invalidado
      const payloadWithInvalidatedToken = { token: originalToken }
      const { status: invalidatedStatus, data: invalidatedData } = await refreshJWT(
        payloadWithInvalidatedToken
      )
      expect(invalidatedStatus).toBe(401)
      expect(invalidatedData.message).toBe('Token expirado ou inválido')
    })

    test('should maintain user data consistency after refresh', async () => {
      const loginPayload = {
        email: 'consistency@refresh-jwt.forja.test',
        password: 'ValidPass123!'
      }

      const userCreated = await createTestUser(loginPayload)
      expect(userCreated).toBe(true)

      const { data: loginData } = await loginUserJWT(loginPayload)

      const refreshPayload = {
        token: loginData.token
      }

      const { data: refreshData } = await refreshJWT(refreshPayload)

      // Check if the user data is consistent
      expect(refreshData.user.id).toBe(loginData.user.id)
      expect(refreshData.user.name).toBe(loginData.user.name)
      expect(refreshData.user.email).toBe(loginData.user.email)

      const decodedOriginal = await user.verifyJWTToken(loginData.token)
      const decodedRefresh = await user.verifyJWTToken(refreshData.token)

      expect(decodedOriginal?.id).toBe(decodedRefresh?.id)
      expect(decodedOriginal?.name).toBe(decodedRefresh?.name)
      expect(decodedOriginal?.email).toBe(decodedRefresh?.email)
    })
  })
})
