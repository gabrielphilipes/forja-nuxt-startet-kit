import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, type QueryResult } from 'pg'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env') })

export const dbCredentials = {
  host: process.env.POSTGRES_HOST!,
  database: process.env.POSTGRES_DB!,
  port: parseInt(process.env.POSTGRES_PORT!),
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
  ssl: false
}

const poolConnection = new Pool({ ...dbCredentials })

export const useDB = (): ReturnType<typeof drizzle> => {
  return drizzle({ client: poolConnection })
}

export const useQueryDB = async (query: string, params?: unknown[]): Promise<QueryResult> => {
  try {
    const client = useDB().$client
    return await client.query(query, params)
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'Erro na conexão com o banco de dados'
    })
  }
}
