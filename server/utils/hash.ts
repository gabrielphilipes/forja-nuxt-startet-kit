import bcrypt from 'bcrypt'

const getSaltRounds = (): number => {
  return process.env.NODE_ENV === 'production' ? 14 : 1
}

export const createHashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, getSaltRounds())
}

export const verifyHashPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}
