import type { UserLogin } from '~~/server/models/user'

export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession()

  // Clear user session if not logged in
  const { clear: logoutUserSession } = useUserSession()

  if (!loggedIn.value) {
    await logoutUserSession()
    return await navigateTo('/entrar')
  }

  const user = useState<UserLogin | null>('user', () => null)

  const { data, error } = await useFetch('/api/v1/auth/me')

  if (error.value) {
    await logoutUserSession()
    return await navigateTo('/entrar')
  }

  user.value = data.value as UserLogin
})
