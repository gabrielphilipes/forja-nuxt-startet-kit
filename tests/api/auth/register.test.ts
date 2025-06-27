import { afterAll, describe, expect, test } from 'vitest'
import { users } from '../../../server/database/schemas/users'
import { useDB } from '../../../server/utils/database'
import { like } from 'drizzle-orm'

afterAll(async () => {
  await useDB().delete(users).where(like(users.email, '%@forja.test'))
})

describe('Register user', () => {
  test('should register a new user using password', async () => {
    const payload = {
      name: 'John Doe',
      email: 'john.doe@forja.test',
      password: 'Philipe@18.'
    }
    const request = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    expect(request.status).toBe(201)

    // Check in database
    const [user] = await useDB().select().from(users).where(like(users.email, '%@forja.test'))
    expect(user).toBeDefined()
    expect(user?.email).toBe(payload.email)
    expect(user?.name).toBe(payload.name)
  })
})
