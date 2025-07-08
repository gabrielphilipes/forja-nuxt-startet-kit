import { z } from 'zod'

export const LoginUserSchema = z.object({
  email: z.string().email('Confirme se o e-mail está correto').max(255, 'E-mail inválido'),
  password: z.string().max(255, 'Senha inválida')
})
