import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull(),
  date: text('date').notNull(),
  slot: text('slot').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  createdAt: text('created_at').notNull(),
}, table => [uniqueIndex('idx_bookings_date_slot').on(table.date, table.slot)]);
