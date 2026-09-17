import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
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

export const availability = sqliteTable('availability', {date: text('date').notNull(), slot: text('slot').notNull(), visible: integer('visible').notNull().default(1), active: integer('active').notNull().default(1)}, table => [uniqueIndex('idx_availability_date_slot').on(table.date, table.slot)]);
