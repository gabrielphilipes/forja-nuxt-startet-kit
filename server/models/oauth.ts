import type { OAuthProvider, UserOAuth } from '#server/database/schemas/users_oauth'
import type { InsertUser, User } from '#server/database/schemas/users'
import { usersOAuth } from '#server/database/schemas/users_oauth'
import { useDB } from '#server/utils/database'
import { and, eq } from 'drizzle-orm'
import user from './user'

interface UserOAuthData {
  name: string
  email: string
  avatar?: string
}

interface OAuthHandler {
  user: User | InsertUser
  action: 'new_user' | 'existing_user' | 'existing_user_new_provider'
}

const handler = async (
  userData: UserOAuthData,
  provider: OAuthProvider,
  providerUserId: string
): Promise<OAuthHandler> => {
  const existingUser = await user.findByEmail(userData.email)

  // If no existing user, create user and link to provider
  if (!existingUser) {
    const newUser = await user.createUsingOAuth(userData)

    await registerOAuth(newUser.id!, provider, providerUserId)

    const userTransform = user.transformToLogin(newUser)

    return {
      user: userTransform,
      action: 'new_user'
    }
  }

  const userOAuth = await findByUserIdAndProvider(existingUser.id, provider)

  // If email is already registered and linked to the provider
  if (userOAuth) {
    const userTransform = user.transformToLogin(existingUser)

    return {
      user: userTransform,
      action: 'existing_user'
    }
  }

  // If email is already registered and NOT linked to the provider, bind to provider
  await registerOAuth(existingUser.id, provider, providerUserId)

  const userTransform = user.transformToLogin(existingUser)

  return {
    user: userTransform,
    action: 'existing_user_new_provider'
  }
}

const registerOAuth = async (
  userId: string,
  provider: OAuthProvider,
  providerUserId: string
): Promise<UserOAuth | null> => {
  try {
    const [oauth] = await useDB()
      .insert(usersOAuth)
      .values({
        user_id: userId,
        provider,
        provider_user_id: providerUserId
      })
      .returning()

    return oauth
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro interno ao vincular usuário/OAuth' })
  }
}

const findByUserIdAndProvider = async (
  userId: string,
  provider: OAuthProvider
): Promise<UserOAuth | null> => {
  try {
    const [userOAuth] = await useDB()
      .select()
      .from(usersOAuth)
      .where(and(eq(usersOAuth.user_id, userId), eq(usersOAuth.provider, provider)))

    return userOAuth
  } catch (error) {
    console.error(error)
    throw createError({ statusCode: 500, message: 'Erro interno ao buscar usuário/OAuth' })
  }
}

export default {
  handler
}
