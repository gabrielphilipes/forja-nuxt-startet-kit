import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import { request } from '#tests/setup'
import { like } from 'drizzle-orm'

const register = async (
  email: string,
  password: string = 'ValidPass123!',
  name: string = 'Test User'
): Promise<boolean> => {
  const { status, data } = await request('v1/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password
    }
  })

  if (status !== 201) {
    throw new Error(`Failed to register user: ${data}`)
  }

  return status === 201
}

const deleteLikedEmails = async (email: string) => {
  await useDB().delete(users).where(like(users.email, email))
}

export default {
  register,
  deleteLikedEmails
}
