import { requiredAuth } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requiredAuth(event)

  return user
})
