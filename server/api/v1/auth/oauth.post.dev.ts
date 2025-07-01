import { OAuthProvider } from '~~/server/database/schemas/users_oauth'
import oauth from '~~/server/models/oauth'
import z from 'zod'

const OAuthHandlerSchema = z.object({
  user: z.object({
    email: z.string().email(),
    name: z.string(),
    avatar: z.string().optional()
  }),
  provider: z.nativeEnum(OAuthProvider),
  provider_user_id: z.string()
})

export default defineEventHandler(async (event) => {
  const { success, data, error } = await readValidatedBody(event, (body) =>
    OAuthHandlerSchema.safeParse(body)
  )

  if (!success) {
    throw createErrorValidation('Dados inválidos', error)
  }

  const { user, action } = await oauth.handler(data.user, data.provider, data.provider_user_id)

  return { user, action }
})
