import { z } from 'zod'

export const RegisterUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z
    .string()
    .max(255)
    .refine(
      (password) => {
        const hasMinLength = password.length >= 8
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSpecialChar = /[!@#$%^&*]/.test(password)
        return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
      },
      {
        message:
          'A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial'
      }
    )
})
