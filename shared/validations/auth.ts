import { z } from 'zod'

export const LoginUserSchema = z.object({
  email: z.string().email('Confirme se o e-mail está correto').max(255, 'E-mail inválido'),
  password: z.string().max(255, 'Senha inválida')
})

export const RegisterUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  email: z.string().email('Confirme se o e-mail está correto').max(255, 'E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(255, 'Senha muito longa')
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Confirme se o e-mail está correto').max(255, 'E-mail inválido')
})

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .max(255, 'Senha muito longa'),
    password_confirmation: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória')
      .max(255, 'Confirmação de senha muito longa')
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation']
  })
