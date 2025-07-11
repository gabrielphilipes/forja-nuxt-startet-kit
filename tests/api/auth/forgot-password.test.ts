import { OAuthProvider, usersOAuth } from '#server/database/schemas/users_oauth'
import { afterAll, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import mailcrab from '#tests/utils/mailcrab'
import userTest from '#tests/utils/user'
import { request } from '#tests/setup'
import { eq } from 'drizzle-orm'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@forgot-password.forja.test')
  await userTest.deleteLikedEmails('%@reset-password.forja.test')
})

interface ForgotPasswordPayload {
  email?: string
}

interface ResetPasswordPayload {
  email?: string
  token?: string
  password?: string
  password_confirmation?: string
}

// Função para solicitar recuperação de senha
const requestPasswordReset = async (payload: ForgotPasswordPayload, expirationTime?: number) => {
  const query = expirationTime ? `?expiration_time=${expirationTime}` : ''
  const { status, data } = await request(`v1/auth/forgot-password${query}`, {
    method: 'POST',
    body: payload
  })
  return { status, data }
}

// Função para resetar a senha
const resetPassword = async (payload: ResetPasswordPayload) => {
  const { status, data } = await request('v1/auth/reset-password', {
    method: 'POST',
    body: payload,
    ignoreResponseError: true
  })
  return { status, data }
}

describe('POST /api/v1/auth/forgot-password', () => {
  describe('Password recovery request', () => {
    test('should send password reset email for existing user', async () => {
      const email = 'existing.user@forgot-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      const { status } = await requestPasswordReset({ email })

      expect(status).toBe(204)

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetEmail = emails[0]
      expect(resetEmail.subject).toContain(`Recupere sua senha Test User`)

      const emailContent = await mailcrab.getEmailById(resetEmail.id)
      expect(emailContent.html).toContain(`/alterar-senha?token=`)
    })

    test('should return same response for non-existent email (security)', async () => {
      const email = 'nonexistent@forgot-password.forja.test'

      const { status } = await requestPasswordReset({ email })

      expect(status).toBe(204)

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBe(0)
    })

    test('should handle multiple requests for same email', async () => {
      const email = 'multiple.requests@forgot-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      // First request
      const { status: firstStatus } = await requestPasswordReset({ email })
      expect(firstStatus).toBe(204)

      // Second request (should work normally)
      const { status: secondStatus } = await requestPasswordReset({ email })
      expect(secondStatus).toBe(204)

      // Verify that both emails were sent
      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Validation of data', () => {
    test('should reject request without email', async () => {
      const { status, data } = await requestPasswordReset({})

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject invalid email format', async () => {
      const { status, data } = await requestPasswordReset({ email: 'invalid.email' })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject empty email', async () => {
      const { status, data } = await requestPasswordReset({ email: '' })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject email with only whitespace', async () => {
      const { status, data } = await requestPasswordReset({ email: '   ' })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })
  })

  describe('Security validation', () => {
    test('should not reveal if email exists in database', async () => {
      const existingEmail = 'security.existing@forgot-password.forja.test'
      const nonExistingEmail = 'security.nonexistent@forgot-password.forja.test'

      await userTest.register(existingEmail)

      const { status: existingStatus, data: existingData } = await requestPasswordReset({
        email: existingEmail
      })
      const { status: nonExistingStatus, data: nonExistingData } = await requestPasswordReset({
        email: nonExistingEmail
      })

      expect(existingStatus).toBe(204)
      expect(nonExistingStatus).toBe(204)
      expect(existingData).toBeUndefined()
      expect(nonExistingData).toBeUndefined()
    })

    test('should handle email with different case sensitivity', async () => {
      const email = 'CaseSensitive@forgot-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      // Test with different case variations
      const variations = [
        'casesensitive@forgot-password.forja.test',
        'CASESENSITIVE@forgot-password.forja.test',
        'CaseSensitive@forgot-password.forja.test'
      ]

      for (const variation of variations) {
        const { status } = await requestPasswordReset({ email: variation })
        expect(status).toBe(204)
      }
    })
  })
})

describe('POST /api/v1/auth/reset-password', () => {
  // describe('Reset de senha com token válido', () => {
  describe('Reset password with valid token', () => {
    test('should reset password with valid token', async () => {
      const email = 'valid.reset@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const newPassword = 'NewPassword123!'
      const { status } = await resetPassword({
        email,
        token: resetToken,
        password: newPassword,
        password_confirmation: newPassword
      })

      expect(status).toBe(204)

      // Verify if it can login with the new password
      const { status: loginStatus } = await request('v1/auth/login', {
        method: 'POST',
        body: {
          email,
          password: newPassword
        }
      })
      expect(loginStatus).toBe(204)
    })

    test('should reject password shorter than 8 characters', async () => {
      const email = 'short.password@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'Abc@12',
        password_confirmation: 'Abc@12'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
      expect(data.data.password).toContain('Senha deve ter pelo menos 8 caracteres')
    })

    test('should reject password without uppercase letter', async () => {
      const email = 'no.uppercase.letter@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'abcdef123!',
        password_confirmation: 'abcdef123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos uma letra maiúscula')
    })

    test('should reject password without lowercase letter', async () => {
      const email = 'no.lowercase.letter@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'ABCDEF123!',
        password_confirmation: 'ABCDEF123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos uma letra minúscula')
    })

    test('should reject password without number', async () => {
      const email = 'no.number@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'Abcdefgh!',
        password_confirmation: 'Abcdefgh!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos um número')
    })

    test('should reject password without special character', async () => {
      const email = 'no.special.character@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'Abcdef123',
        password_confirmation: 'Abcdef123'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('A senha deve conter pelo menos um caractere especial')
    })
  })

  describe('Validation of reset data', () => {
    test('should reject reset without token', async () => {
      const { status, data } = await resetPassword({
        email: 'reset.without.token@reset-password.forja.test',
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.token).toBeDefined()
    })

    test('should reject reset without password', async () => {
      const { status, data } = await resetPassword({
        email: 'reset.without.password@reset-password.forja.test',
        token: 'some-token',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
    })

    test('should reject reset without password confirmation', async () => {
      const { status, data } = await resetPassword({
        email: 'reset.without.password.confirmation@reset-password.forja.test',
        token: 'some-token',
        password: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password_confirmation).toBeDefined()
    })

    test('should reject when password and confirmation do not match', async () => {
      const email = 'password.validation.mismatch@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'ValidPass123!',
        password_confirmation: 'DifferentPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password_confirmation).toBeDefined()
      expect(data.data.password_confirmation).toContain('As senhas não coincidem')
    })
  })

  describe('Token validation', () => {
    test('should reject invalid token', async () => {
      const { status, data } = await resetPassword({
        email: 'invalid.token@reset-password.forja.test',
        token: 'invalid-token',
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject expired token', async () => {
      const email = 'expired.token@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email }, 1)

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject already used token', async () => {
      const email = 'used.token@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      // First attempt (should work)
      const { status: firstStatus } = await resetPassword({
        email,
        token: resetToken,
        password: 'FirstPass123!',
        password_confirmation: 'FirstPass123!'
      })

      expect(firstStatus).toBe(204)

      // Second attempt with the same token (should fail)
      const { status: secondStatus, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'SecondPass123!',
        password_confirmation: 'SecondPass123!'
      })

      expect(secondStatus).toBe(401)
      expect(data.message).toBe('Token inválido ou expirado')
    })
  })

  describe('Security validation of reset', () => {
    test('should not allow reset for OAuth-only users', async () => {
      const email = 'oauth.only@reset-password.forja.test'

      // Create user without password (only OAuth)
      const { status: registerStatus } = await request('v1/auth/register', {
        method: 'POST',
        body: {
          name: 'OAuth User',
          email,
          password: 'ValidPass123!'
        }
      })
      expect(registerStatus).toBe(201)

      const updatedUser = await useDB()
        .update(users)
        .set({ password: null })
        .where(eq(users.email, email))
        .returning()

      await useDB()
        .insert(usersOAuth)
        .values({
          user_id: updatedUser[0]!.id!,
          provider: OAuthProvider.GOOGLE,
          provider_user_id: 'google_oauth_user_123'
        })
        .returning()

      const { status, data } = await requestPasswordReset({ email })

      expect(status).toBe(400)
      expect(data.message).toBe('Usuário não pode trocar a senha, pois é apenas OAuth')
    })

    test('should handle concurrent reset attempts', async () => {
      const email = 'concurrent.reset@reset-password.forja.test'
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })

      const emails = await mailcrab.getEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetToken = await mailcrab.getTokenByResetPasswordFromEmail(emails[0].id)

      // Simulate concurrent attempts
      const promises = [
        resetPassword({
          email,
          token: resetToken,
          password: 'FirstPass123!',
          password_confirmation: 'FirstPass123!'
        }),
        resetPassword({
          email,
          token: resetToken,
          password: 'SecondPass123!',
          password_confirmation: 'SecondPass123!'
        })
      ]

      const results = await Promise.all(promises)

      // Only one should be successful
      const successCount = results.filter((r) => r.status === 204).length
      const failureCount = results.filter((r) => r.status === 401).length

      expect(successCount).toBe(1)
      expect(failureCount).toBe(1)
    })
  })
})
