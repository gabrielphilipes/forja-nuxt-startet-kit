import { z } from 'zod'

export const RegisterUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().max(255)
})

export const LoginUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().max(255)
})

export const RefreshJWTSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório')
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email().max(255)
})
