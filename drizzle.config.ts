import { defineConfig } from 'drizzle-kit'
import { dbCredentials } from './server/utils/database'

export default defineConfig({
  out: './server/database/migrations',
  schema: './server/database/schemas',
  dialect: 'postgresql',
  dbCredentials
})
