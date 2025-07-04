import { usersOAuth, OAuthProvider } from '#server/database/schemas/users_oauth'
import { afterAll, describe, expect, test } from 'vitest'
import { users } from '#server/database/schemas/users'
import { useDB } from '#server/utils/database'
import userTest from '#tests/utils/user'
import { request } from '#tests/setup'
import { and, eq } from 'drizzle-orm'

afterAll(async () => {
  await userTest.deleteLikedEmails('%@oauth.forja.test')
})

interface OAuthPayload {
  user?: {
    email?: string
    name?: string
    avatar?: string
  }
  provider?: OAuthProvider
  provider_user_id?: string
}

const oauthRequest = async (payload: OAuthPayload) => {
  const { status, data } = await request('v1/auth/oauth', {
    method: 'POST',
    body: payload
  })
  return { status, data }
}

const createOAuthLink = async (userId: string, provider: OAuthProvider, providerUserId: string) => {
  await useDB().insert(usersOAuth).values({
    user_id: userId,
    provider,
    provider_user_id: providerUserId
  })
}

describe('POST /api/v1/auth/oauth', () => {
  describe('New user scenarios', () => {
    test('should create new user and link to Google provider', async () => {
      const payload = {
        user: {
          email: 'newuser.google@oauth.forja.test',
          name: 'New Google User',
          avatar: 'https://example.com/avatar.jpg'
        },
        provider: OAuthProvider.GOOGLE,
        provider_user_id: 'google_newuser_123'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(payload.user.email)
      expect(data.user.name).toBe(payload.user.name)
      expect(data.action).toBe('new_user')

      // Verify user was created in database
      const [user] = await useDB().select().from(users).where(eq(users.email, payload.user.email))

      expect(user).toBeDefined()
      if (!user) throw new Error('User not found')
      expect(user.name).toBe(payload.user.name)

      // Verify OAuth link was created
      const [oauthLink] = await useDB()
        .select()
        .from(usersOAuth)
        .where(
          and(
            eq(usersOAuth.user_id, user.id),
            eq(usersOAuth.provider, OAuthProvider.GOOGLE),
            eq(usersOAuth.provider_user_id, payload.provider_user_id)
          )
        )

      expect(oauthLink).toBeDefined()
    })

    test('should create new user and link to GitHub provider', async () => {
      const payload = {
        user: {
          email: 'newuser.github@oauth.forja.test',
          name: 'New GitHub User'
        },
        provider: OAuthProvider.GITHUB,
        provider_user_id: 'github_newuser_456'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(payload.user.email)
      expect(data.user.name).toBe(payload.user.name)
      expect(data.action).toBe('new_user')
    })

    test('should create new user and link to Facebook provider', async () => {
      const payload = {
        user: {
          email: 'newuser.facebook@oauth.forja.test',
          name: 'New Facebook User',
          avatar: 'https://facebook.com/avatar.jpg'
        },
        provider: OAuthProvider.FACEBOOK,
        provider_user_id: 'facebook_newuser_789'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(payload.user.email)
      expect(data.user.name).toBe(payload.user.name)
      expect(data.action).toBe('new_user')
    })
  })

  describe('Existing user scenarios', () => {
    test('should return existing user when already linked to same provider', async () => {
      const email = 'existing.linked@oauth.forja.test'
      const providerUserId = 'google_existing_123'

      // Create user first
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      // Get user ID
      const [user] = await useDB().select().from(users).where(eq(users.email, email))
      expect(user).toBeDefined()
      if (!user) throw new Error('User not found')

      // Create OAuth link
      await createOAuthLink(user.id, OAuthProvider.GOOGLE, providerUserId)

      // Try to link same provider again
      const payload = {
        user: {
          email,
          name: 'Existing Linked User',
          avatar: 'https://updated-avatar.jpg'
        },
        provider: OAuthProvider.GOOGLE,
        provider_user_id: providerUserId
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(email)
      expect(data.action).toBe('existing_user')
    })

    test('should link existing user to new provider', async () => {
      const email = 'existing.newprovider@oauth.forja.test'

      // Create user first
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      // Get user ID
      const [user] = await useDB().select().from(users).where(eq(users.email, email))
      expect(user).toBeDefined()
      if (!user) throw new Error('User not found')

      // Create OAuth link for Google
      await createOAuthLink(user.id, OAuthProvider.GOOGLE, 'google_existing_456')

      // Try to link to GitHub (new provider)
      const payload = {
        user: {
          email,
          name: 'Existing User New Provider',
          avatar: 'https://github-avatar.jpg'
        },
        provider: OAuthProvider.GITHUB,
        provider_user_id: 'github_existing_789'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(email)
      expect(data.action).toBe('existing_user_new_provider')

      // Verify new OAuth link was created
      const [oauthLink] = await useDB()
        .select()
        .from(usersOAuth)
        .where(
          and(
            eq(usersOAuth.user_id, user.id),
            eq(usersOAuth.provider, OAuthProvider.GITHUB),
            eq(usersOAuth.provider_user_id, 'github_existing_789')
          )
        )

      expect(oauthLink).toBeDefined()
    })

    test('should handle user with multiple providers', async () => {
      const email = 'multi.provider@oauth.forja.test'

      // Create user first
      const userCreated = await userTest.register(email)
      expect(userCreated).toBe(true)

      // Get user ID
      const [user] = await useDB().select().from(users).where(eq(users.email, email))
      expect(user).toBeDefined()
      if (!user) throw new Error('User not found')

      // Create OAuth links for multiple providers
      await createOAuthLink(user.id, OAuthProvider.GOOGLE, 'google_multi_123')
      await createOAuthLink(user.id, OAuthProvider.GITHUB, 'github_multi_456')

      // Try to link to Facebook (third provider)
      const payload = {
        user: {
          email,
          name: 'Multi Provider User',
          avatar: 'https://facebook-multi.jpg'
        },
        provider: OAuthProvider.FACEBOOK,
        provider_user_id: 'facebook_multi_789'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(email)
      expect(data.action).toBe('existing_user_new_provider')

      // Verify all OAuth links exist
      const oauthLinks = await useDB()
        .select()
        .from(usersOAuth)
        .where(eq(usersOAuth.user_id, user.id))

      expect(oauthLinks).toHaveLength(3)
      expect(oauthLinks.some((link) => link.provider === OAuthProvider.GOOGLE)).toBe(true)
      expect(oauthLinks.some((link) => link.provider === OAuthProvider.GITHUB)).toBe(true)
      expect(oauthLinks.some((link) => link.provider === OAuthProvider.FACEBOOK)).toBe(true)
    })
  })

  describe('Edge cases', () => {
    test('should handle user without avatar', async () => {
      const payload = {
        user: {
          email: 'noavatar@oauth.forja.test',
          name: 'User Without Avatar'
        },
        provider: OAuthProvider.GOOGLE,
        provider_user_id: 'google_noavatar_123'
      }

      const { status, data } = await oauthRequest(payload)

      expect(status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe(payload.user.email)
      expect(data.user.name).toBe(payload.user.name)
      expect(data.action).toBe('new_user')
    })

    test('should handle duplicate provider_user_id for different users', async () => {
      const email1 = 'duplicate1@oauth.forja.test'
      const email2 = 'duplicate2@oauth.forja.test'
      const providerUserId = 'duplicate_provider_123'

      // Create first user
      const payload1 = {
        user: {
          email: email1,
          name: 'Duplicate User 1'
        },
        provider: OAuthProvider.GOOGLE,
        provider_user_id: providerUserId
      }

      const { status: status1, data: data1 } = await oauthRequest(payload1)
      expect(status1).toBe(200)
      expect(data1.action).toBe('new_user')

      // Create second user with same provider_user_id but different provider
      const payload2 = {
        user: {
          email: email2,
          name: 'Duplicate User 2'
        },
        provider: OAuthProvider.GITHUB,
        provider_user_id: providerUserId
      }

      const { status: status2, data: data2 } = await oauthRequest(payload2)
      expect(status2).toBe(200)
      expect(data2.action).toBe('new_user')

      // Verify both users exist
      const [user1] = await useDB().select().from(users).where(eq(users.email, email1))
      const [user2] = await useDB().select().from(users).where(eq(users.email, email2))

      expect(user1).toBeDefined()
      expect(user2).toBeDefined()
      if (!user1 || !user2) throw new Error('Users not found')
      expect(user1.id).not.toBe(user2.id)
    })

    test('should handle case sensitivity in email', async () => {
      const email = 'CaseSensitive@oauth.forja.test'
      const emailLower = email.toLowerCase()

      // Create user with original case
      const payload1 = {
        user: {
          email,
          name: 'Case Sensitive User'
        },
        provider: OAuthProvider.GOOGLE,
        provider_user_id: 'google_case_123'
      }

      const { status: status1, data: data1 } = await oauthRequest(payload1)
      expect(status1).toBe(200)
      expect(data1.action).toBe('new_user')

      // Try to link with different case
      const payload2 = {
        user: {
          email: emailLower,
          name: 'Case Sensitive User Updated'
        },
        provider: OAuthProvider.GITHUB,
        provider_user_id: 'github_case_456'
      }

      const { status: status2, data: data2 } = await oauthRequest(payload2)
      expect(status2).toBe(200)
      expect(data2.action).toBe('existing_user_new_provider')
    })
  })
})
