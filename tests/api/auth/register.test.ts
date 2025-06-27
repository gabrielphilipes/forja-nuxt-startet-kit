import { afterAll, describe, expect, test } from 'vitest'
import { users } from '../../../server/database/schemas/users'
import { useDB } from '../../../server/utils/database'
import { eq, like } from 'drizzle-orm'
import { ofetch } from 'ofetch'

afterAll(async () => {
  await useDB().delete(users).where(like(users.email, '%@forja.test'))
})

describe('Register user', () => {
  test('Register a new user using password', async () => {
    const payload = {
      name: 'John Doe',
      email: 'john.doe@forja.test',
      password: 'Philipe@18.'
    }

    await ofetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: payload
    }).then((response) => {
      expect(response).toBe('')
    })

    // Check in database
    const [user] = await useDB().select().from(users).where(like(users.email, '%@forja.test'))
    expect(user).toBeDefined()
    expect(user?.email).toBe(payload.email)
    expect(user?.name).toBe(payload.name)
  })

  describe('Not register a new user: invalid payload', () => {
    test('missing password', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'philipe.invalid@forja.test'
      }
      await ofetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        body: payload
      }).catch((error) => {
        const response = error.data
        expect(error.status).toBe(400)
        expect(response.data.password).toBeDefined()
        expect(response.data.password).toEqual(['Required'])
        expect(response.message).toBe('Ajuste os dados enviados e tente novamente')
      })

      // Check in database
      const [user] = await useDB().select().from(users).where(eq(users.email, payload.email))
      expect(user).toBeUndefined()
    })

    test('missing name', async () => {
      const payload = {
        email: 'philipe.missing.name@forja.test',
        password: 'Abc@123456'
      }
      await ofetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        body: payload
      }).catch((error) => {
        const response = error.data
        expect(error.status).toBe(400)
        expect(response.data.name).toBeDefined()
        expect(response.data.name).toEqual(['Required'])
        expect(response.message).toBe('Ajuste os dados enviados e tente novamente')
      })

      // Check in database
      const [user] = await useDB().select().from(users).where(eq(users.email, payload.email))
      expect(user).toBeUndefined()
    })

    test('missing email', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        password: 'Abc@123456'
      }

      await ofetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        body: payload
      }).catch((error) => {
        const response = error.data
        expect(error.status).toBe(400)
        expect(response.data.email).toBeDefined()
        expect(response.data.email).toEqual(['Required'])
        expect(response.message).toBe('Ajuste os dados enviados e tente novamente')
      })
    })

    test('invalid email', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'philipe.invalid.email',
        password: 'Abc@123456'
      }
      await ofetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        body: payload
      }).catch((error) => {
        const response = error.data
        expect(error.status).toBe(400)
        expect(response.data.email).toBeDefined()
        expect(response.data.email).toEqual(['Invalid email'])
        expect(response.message).toBe('Ajuste os dados enviados e tente novamente')
      })

      // Check in database
      const [user] = await useDB().select().from(users).where(eq(users.email, payload.email))
      expect(user).toBeUndefined()
    })

    test('invalid password', async () => {
      const payload = {
        name: 'Gabriel Philipe',
        email: 'philipe.invalid.password@forja.test',
        password: '123456'
      }

      await ofetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        body: payload
      }).catch((error) => {
        const response = error.data
        expect(error.status).toBe(400)
        expect(response.data.password).toBeDefined()
        expect(response.data.password).toEqual([
          'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial'
        ])
        expect(response.message).toBe('Ajuste os dados enviados e tente novamente')
      })

      // Check in database
      const [user] = await useDB().select().from(users).where(eq(users.email, payload.email))
      expect(user).toBeUndefined()
    })
  })
})
