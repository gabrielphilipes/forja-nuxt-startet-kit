import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const teste = pgTable('teste', {
  id: serial('id').primaryKey(),
  name: text('name').notNull()
})
