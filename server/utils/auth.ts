import type { User } from '#server/database/schemas/users'
import { config } from 'dotenv'
import { resolve } from 'path'
import * as jose from 'jose'

config({ path: resolve(process.cwd(), '.env'), quiet: true, debug: false })

interface JWTTokenPayload {
  id: string
  name: string
  email: string
  exp?: number
}

const secret = Buffer.from(process.env.NUXT_SESSION_PASSWORD!, 'utf-8')

export const generateJWTToken = async (user: User): Promise<string> => {
  const payload: JWTTokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email
  }

  const token = await new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)

  return token
}

export const verifyJWTToken = async (token: string): Promise<JWTTokenPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as unknown as JWTTokenPayload
  } catch (error) {
    console.error(error)
    return null
  }
}
