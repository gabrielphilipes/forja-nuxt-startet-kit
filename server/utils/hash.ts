import bcrypt from 'bcrypt'
import { createCipheriv, createDecipheriv } from 'crypto'

const getSaltRounds = (): number => {
  return process.env.NODE_ENV === 'production' ? 14 : 1
}

export const createHashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, getSaltRounds())
}

export const verifyHashPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// Crypto crypt algorithm
const cryptAlgorithm = 'aes-256-ecb'

const getEncryptionKey = (): Buffer => {
  let envKey = process.env.ENCRYPTION_KEY

  if (!envKey) {
    console.warn(
      '⚠️ No ENCRYPTION_KEY found in environment variables. Using fallback key. This is not secure for production!'
    )

    envKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  }

  return Buffer.from(envKey, 'hex')
}

const key = getEncryptionKey()

export const encrypt = (text: string): string => {
  const cipher = createCipheriv(cryptAlgorithm, key, null)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export const decrypt = (encrypted: string): string => {
  const decipher = createDecipheriv(cryptAlgorithm, key, null)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
