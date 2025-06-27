import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .notNull()
    .unique()
    .$default(() => nanoid(20)),
  name: text('name').notNull(),
  avatar: text('avatar'),
  email: text('email').notNull().unique(),
  email_verified_at: timestamp('email_verified_at', { withTimezone: true }),
  password: text('password'),
  last_activity: timestamp('last_activity', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
})

export type User = typeof users.$inferSelect
export type InsertUser = typeof users.$inferInsert
