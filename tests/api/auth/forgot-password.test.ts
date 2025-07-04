import { afterAll, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import { like, eq } from 'drizzle-orm'
import { request } from '#tests/setup'
import { OAuthProvider, usersOAuth } from '#server/database/schemas/users_oauth'

afterAll(async () => {
  await useDB().delete(users).where(like(users.email, '%@forgot-password.forja.test'))
  await useDB().delete(users).where(like(users.email, '%@reset-password.forja.test'))

  await removeMailcrabEmails()
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

// Função para buscar e-mails no mailcrab
const getMailcrabEmails = async (email: string) => {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const mailcrabPort = process.env.MAILCRAB_PORT || '1080'
  const response = await fetch(`http://localhost:${mailcrabPort}/api/messages`)

  if (!response.ok) {
    throw new Error('Falha ao buscar e-mails do mailcrab')
  }

  const messages = await response.json()
  return messages.filter((msg: { envelope_recipients: string[] }) =>
    msg.envelope_recipients.includes(email)
  )
}

const getMailcrabEmailById = async (id: string) => {
  const mailcrabPort = process.env.MAILCRAB_PORT || '1080'
  const response = await fetch(`http://localhost:${mailcrabPort}/api/message/${id}`)
  return response.json()
}

const removeMailcrabEmails = async () => {
  const mailcrabPort = process.env.MAILCRAB_PORT || '1080'
  const response = await fetch(`http://localhost:${mailcrabPort}/api/delete-all`, {
    method: 'POST'
  })
  return response.json()
}

// Função para criar usuário de teste
const createTestUser = async (email: string, password: string = 'ValidPass123!') => {
  const { status } = await request('v1/auth/register', {
    method: 'POST',
    body: {
      name: 'Test User',
      email,
      password
    }
  })
  return status === 201
}

describe('POST /api/v1/auth/forgot-password', () => {
  describe('Solicitação de recuperação de senha', () => {
    test('should send password reset email for existing user', async () => {
      const email = 'existing.user@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      const { status } = await requestPasswordReset({ email })

      expect(status).toBe(204)

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const resetEmail = emails[0]
      expect(resetEmail.subject).toContain(`Recupere sua senha Test User`)

      const emailContent = await getMailcrabEmailById(resetEmail.id)
      expect(emailContent.html).toContain(`/alterar-senha?token=`)
    })

    test('should return same response for non-existent email (security)', async () => {
      const email = 'nonexistent@forgot-password.forja.test'

      const { status } = await requestPasswordReset({ email })

      expect(status).toBe(204)

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBe(0)
    })

    test('should handle multiple requests for same email', async () => {
      const email = 'multiple.requests@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      // Primeira solicitação
      const { status: firstStatus } = await requestPasswordReset({ email })
      expect(firstStatus).toBe(204)

      // Segunda solicitação (deve funcionar normalmente)
      const { status: secondStatus } = await requestPasswordReset({ email })
      expect(secondStatus).toBe(204)

      // Verifica que ambos os e-mails foram enviados
      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBe(2)
    })
  })

  describe('Validação de dados', () => {
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

  describe('Validação de segurança', () => {
    test('should not reveal if email exists in database', async () => {
      const existingEmail = 'security.existing@forgot-password.forja.test'
      const nonExistingEmail = 'security.nonexistent@forgot-password.forja.test'

      await createTestUser(existingEmail)

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
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      // Testa com diferentes variações de case
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
  describe('Reset de senha com token válido', () => {
    test('should reset password with valid token', async () => {
      const email = 'valid.reset@reset-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

      const newPassword = 'NewPassword123!'
      const { status } = await resetPassword({
        email,
        token: resetToken,
        password: newPassword,
        password_confirmation: newPassword
      })

      expect(status).toBe(204)

      // Verifica se consegue fazer login com a nova senha
      const { status: loginStatus } = await request('v1/auth/login', {
        method: 'POST',
        body: {
          email,
          password: newPassword
        }
      })
      expect(loginStatus).toBe(204)
    })

    test('should validate password requirements on reset', async () => {
      const email = 'password.validation@reset-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

      // Short password
      const { status: shortStatus, data: shortData } = await resetPassword({
        email,
        token: resetToken,
        password: 'Abc@12',
        password_confirmation: 'Abc@12'
      })

      expect(shortStatus).toBe(400)
      expect(shortData.message).toBe('A senha deve ter pelo menos 8 caracteres')

      // No uppercase letter
      const { status: noUpperStatus, data: noUpperData } = await resetPassword({
        email,
        token: resetToken,
        password: 'abcdef123!',
        password_confirmation: 'abcdef123!'
      })

      console.log(noUpperData)

      expect(noUpperStatus).toBe(400)
      expect(noUpperData.message).toBe('A senha deve conter pelo menos uma letra maiúscula')

      // No lowercase letter
      const { status: noLowerStatus, data: noLowerData } = await resetPassword({
        token: resetToken,
        password: 'ABCDEF123!',
        password_confirmation: 'ABCDEF123!'
      })

      expect(noLowerStatus).toBe(400)
      expect(noLowerData.message).toBe('A senha deve conter pelo menos uma letra minúscula')

      // No number
      const { status: noNumberStatus, data: noNumberData } = await resetPassword({
        token: resetToken,
        password: 'Abcdefgh!',
        password_confirmation: 'Abcdefgh!'
      })

      expect(noNumberStatus).toBe(400)
      expect(noNumberData.message).toBe('A senha deve conter pelo menos um número')

      // No special character
      const { status: noSpecialStatus, data: noSpecialData } = await resetPassword({
        token: resetToken,
        password: 'Abcdef123',
        password_confirmation: 'Abcdef123'
      })

      expect(noSpecialStatus).toBe(400)
      expect(noSpecialData.message).toBe('A senha deve conter pelo menos um caractere especial')
    })
  })

  describe('Validação de dados do reset', () => {
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

    test('should reject reset without email', async () => {
      const { status, data } = await resetPassword({
        token: 'some-token',
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.email).toBeDefined()
    })

    test('should reject when password and confirmation do not match', async () => {
      const email = 'password.validation.mismatch@reset-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

      const { status, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'ValidPass123!',
        password_confirmation: 'DifferentPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('As senhas não coincidem')
    })
  })

  describe('Validação de token', () => {
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
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email }, 1)
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

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
      const email = 'used.token@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

      // Primeira tentativa (deve funcionar)
      const { status: firstStatus } = await resetPassword({
        email,
        token: resetToken,
        password: 'FirstPass123!',
        password_confirmation: 'FirstPass123!'
      })

      expect(firstStatus).toBe(204)

      // Segunda tentativa com o mesmo token (deve falhar)
      const { status: secondStatus, data } = await resetPassword({
        email,
        token: resetToken,
        password: 'SecondPass123!',
        password_confirmation: 'SecondPass123!'
      })

      expect(secondStatus).toBe(401)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject token for different user', async () => {
      const user1Email = 'user1.token@forgot-password.forja.test'
      const user2Email = 'user2.token@forgot-password.forja.test'

      await createTestUser(user1Email)
      await createTestUser(user2Email)

      // Solicita reset para user1
      await requestPasswordReset({ email: user1Email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(user1Email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const user1ResetToken = resetButton.href.split('?token=')[1]

      await new Promise((resolve) => setTimeout(resolve, 50))

      // Tenta usar o token do user1 para resetar senha do user2
      const { status, data } = await resetPassword({
        email: user2Email,
        token: user1ResetToken,
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(401)
      expect(data.message).toBe('Token inválido ou expirado')
    })
  })

  describe('Validação de segurança do reset', () => {
    test('should not allow reset for OAuth-only users', async () => {
      const email = 'oauth.only@reset-password.forja.test'

      // Cria usuário sem senha (apenas OAuth)
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
      const email = 'concurrent.reset@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 50))

      const emails = await getMailcrabEmails(email)
      expect(emails.length).toBeGreaterThan(0)

      const emailContent = await getMailcrabEmailById(emails[0].id)
      const emailContentElement = new DOMParser().parseFromString(emailContent.html, 'text/html')
      const resetButton = emailContentElement.body.querySelector(
        '#reset-password-button'
      ) as HTMLAnchorElement
      const resetToken = resetButton.href.split('?token=')[1]

      // Simulates concurrent attempts
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

      // Only one should succeed
      const successCount = results.filter((r) => r.status === 204).length
      const failureCount = results.filter((r) => r.status === 401).length

      expect(successCount).toBe(1)
      expect(failureCount).toBe(1)
    })
  })
})
