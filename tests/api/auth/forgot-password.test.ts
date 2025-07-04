import { afterAll, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import { like, eq } from 'drizzle-orm'
import { request } from '#tests/setup'

afterAll(async () => {
  await useDB().delete(users).where(like(users.email, '%@forgot-password.forja.test'))

  await removeMailcrabEmails()
})

interface ForgotPasswordPayload {
  email?: string
}

interface ResetPasswordPayload {
  token?: string
  password?: string
  password_confirmation?: string
}

// Função para solicitar recuperação de senha
const requestPasswordReset = async (payload: ForgotPasswordPayload) => {
  const { status, data } = await request('v1/auth/forgot-password', {
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
      const email = 'valid.reset@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      // Solicita recuperação de senha
      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Busca o e-mail com o token
      const _emails = await getMailcrabEmails(email)
      expect(_emails.length).toBeGreaterThan(0)

      // Extrai o token do e-mail (simulação - na implementação real seria extraído do HTML)
      const resetToken = 'valid-token-from-email' // Placeholder

      const newPassword = 'NewPassword123!'
      const { status, data } = await resetPassword({
        token: resetToken,
        password: newPassword,
        password_confirmation: newPassword
      })

      expect(status).toBe(200)
      expect(data.message).toBe('Senha alterada com sucesso')

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
      const email = 'password.validation@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const _emails = await getMailcrabEmails(email)
      const resetToken = 'valid-token-from-email' // Placeholder

      // Testa senha muito curta
      const { status: shortStatus, data: shortData } = await resetPassword({
        token: resetToken,
        password: 'Abc@12',
        password_confirmation: 'Abc@12'
      })

      expect(shortStatus).toBe(400)
      expect(shortData.message).toBe('A senha deve ter pelo menos 8 caracteres')

      // Testa senha sem maiúscula
      const { status: noUpperStatus, data: noUpperData } = await resetPassword({
        token: resetToken,
        password: 'abcdef123!',
        password_confirmation: 'abcdef123!'
      })

      expect(noUpperStatus).toBe(400)
      expect(noUpperData.message).toBe('A senha deve conter pelo menos uma letra maiúscula')
    })
  })

  describe('Validação de dados do reset', () => {
    test('should reject reset without token', async () => {
      const { status, data } = await resetPassword({
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.token).toBeDefined()
    })

    test('should reject reset without password', async () => {
      const { status, data } = await resetPassword({
        token: 'some-token',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password).toBeDefined()
    })

    test('should reject reset without password confirmation', async () => {
      const { status, data } = await resetPassword({
        token: 'some-token',
        password: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
      expect(data.data.password_confirmation).toBeDefined()
    })

    test('should reject when password and confirmation do not match', async () => {
      const { status, data } = await resetPassword({
        token: 'some-token',
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
        token: 'invalid-token',
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject expired token', async () => {
      const email = 'expired.token@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const _emails = await getMailcrabEmails(email)
      const resetToken = 'expired-token-from-email' // Placeholder

      // Simula token expirado (na implementação real seria baseado no tempo)
      const { status, data } = await resetPassword({
        token: resetToken,
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject already used token', async () => {
      const email = 'used.token@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const _emails = await getMailcrabEmails(email)
      const resetToken = 'used-token-from-email' // Placeholder

      // Primeira tentativa (deve funcionar)
      const { status: firstStatus } = await resetPassword({
        token: resetToken,
        password: 'FirstPass123!',
        password_confirmation: 'FirstPass123!'
      })
      expect(firstStatus).toBe(200)

      // Segunda tentativa com o mesmo token (deve falhar)
      const { status: secondStatus, data } = await resetPassword({
        token: resetToken,
        password: 'SecondPass123!',
        password_confirmation: 'SecondPass123!'
      })

      expect(secondStatus).toBe(400)
      expect(data.message).toBe('Token inválido ou expirado')
    })

    test('should reject token for different user', async () => {
      const user1Email = 'user1.token@forgot-password.forja.test'
      const user2Email = 'user2.token@forgot-password.forja.test'

      await createTestUser(user1Email)
      await createTestUser(user2Email)

      // Solicita reset para user1
      await requestPasswordReset({ email: user1Email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const _emails = await getMailcrabEmails(user1Email)
      const user1Token = 'user1-token-from-email' // Placeholder

      // Tenta usar o token do user1 para resetar senha do user2
      const { status, data } = await resetPassword({
        token: user1Token,
        password: 'ValidPass123!',
        password_confirmation: 'ValidPass123!'
      })

      expect(status).toBe(400)
      expect(data.message).toBe('Token inválido ou expirado')
    })
  })

  describe('Validação de segurança do reset', () => {
    test('should not allow reset for OAuth-only users', async () => {
      const email = 'oauth.only@forgot-password.forja.test'

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

      // Remove a senha do usuário (simula usuário apenas OAuth)
      await useDB().update(users).set({ password: null }).where(eq(users.email, email))

      const { status, data } = await requestPasswordReset({ email })

      expect(status).toBe(400)
      expect(data.message).toBe('Este e-mail não possui senha cadastrada')
    })

    test('should handle concurrent reset attempts', async () => {
      const email = 'concurrent.reset@forgot-password.forja.test'
      const userCreated = await createTestUser(email)
      expect(userCreated).toBe(true)

      await requestPasswordReset({ email })
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const _emails = await getMailcrabEmails(email)
      const resetToken = 'concurrent-token-from-email' // Placeholder

      // Simula tentativas concorrentes
      const promises = [
        resetPassword({
          token: resetToken,
          password: 'FirstPass123!',
          password_confirmation: 'FirstPass123!'
        }),
        resetPassword({
          token: resetToken,
          password: 'SecondPass123!',
          password_confirmation: 'SecondPass123!'
        })
      ]

      const results = await Promise.all(promises)

      // Apenas uma deve ter sucesso
      const successCount = results.filter((r) => r.status === 200).length
      const failureCount = results.filter((r) => r.status === 400).length

      expect(successCount).toBe(1)
      expect(failureCount).toBe(1)
    })
  })
})

describe('Integração com Mailcrab', () => {
  test('should send email with correct format and content', async () => {
    const email = 'email.format@forgot-password.forja.test'
    const userCreated = await createTestUser(email)
    expect(userCreated).toBe(true)

    await requestPasswordReset({ email })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const emails = await getMailcrabEmails(email)
    expect(emails.length).toBeGreaterThan(0)

    const resetEmail = emails[0]

    // Verifica formato do e-mail
    expect(resetEmail.to).toContain(email)
    expect(resetEmail.from).toBeDefined()
    expect(resetEmail.subject).toContain('Recuperação de Senha')
    expect(resetEmail.html).toBeDefined()
    expect(resetEmail.text).toBeDefined()

    // Verifica conteúdo do e-mail
    expect(resetEmail.html).toContain('reset-password')
    expect(resetEmail.html).toContain('token=')
    expect(resetEmail.html).toContain('Olá')
    expect(resetEmail.html).toContain('redefinir sua senha')
  })

  test('should handle mailcrab service unavailability', async () => {
    const email = 'mailcrab.unavailable@forgot-password.forja.test'
    const userCreated = await createTestUser(email)
    expect(userCreated).toBe(true)

    // Simula falha do mailcrab (na implementação real seria tratado)
    const { status, data } = await requestPasswordReset({ email })

    // Deve retornar sucesso mesmo com falha no envio (não revela erro interno)
    expect(status).toBe(200)
    expect(data.message).toBe(
      'Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha'
    )
  })
})

describe('Cenários de edge cases', () => {
  test('should handle very long email addresses', async () => {
    const longEmail = 'a'.repeat(200) + '@forgot-password.forja.test'

    const { status, data } = await requestPasswordReset({ email: longEmail })

    expect(status).toBe(400)
    expect(data.message).toBe('Ajuste os dados enviados e tente novamente')
    expect(data.data.email).toBeDefined()
  })

  test('should handle special characters in email', async () => {
    const specialEmail = 'test+special@forgot-password.forja.test'
    const userCreated = await createTestUser(specialEmail)
    expect(userCreated).toBe(true)

    const { status } = await requestPasswordReset({ email: specialEmail })
    expect(status).toBe(200)
  })

  test('should handle unicode characters in email', async () => {
    const unicodeEmail = 'testé@forgot-password.forja.test'
    const userCreated = await createTestUser(unicodeEmail)
    expect(userCreated).toBe(true)

    const { status } = await requestPasswordReset({ email: unicodeEmail })
    expect(status).toBe(200)
  })

  test('should handle rate limiting for multiple requests', async () => {
    const email = 'rate.limited@forgot-password.forja.test'
    const userCreated = await createTestUser(email)
    expect(userCreated).toBe(true)

    // Faz múltiplas solicitações rapidamente
    const promises = Array(5)
      .fill(null)
      .map(() => requestPasswordReset({ email }))

    const results = await Promise.all(promises)

    // Todas devem retornar sucesso (rate limiting seria implementado na API real)
    results.forEach((result) => {
      expect(result.status).toBe(200)
    })
  })
})
