import { z } from 'zod'

export const RefreshJWTSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório')
})
