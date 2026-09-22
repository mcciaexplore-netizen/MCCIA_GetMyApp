import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(),
  appId: text('app_id').notNull(),
  appName: text('app_name').notNull(),
  date: text('date').notNull(),
  slot: text('slot').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  createdAt: text('created_at').notNull(),
}, table => [uniqueIndex('idx_bookings_app_date_slot_email').on(table.appId, table.date, table.slot, table.email)]);

export const availability = sqliteTable('availability', {date: text('date').notNull(), slot: text('slot').notNull(), visible: integer('visible').notNull().default(1), active: integer('active').notNull().default(1)}, table => [uniqueIndex('idx_availability_date_slot').on(table.date, table.slot)]);

// One row per booking (booking_id is the primary key), created automatically when a booking
// is created. Holds only operational/session data, never a copy of participant/application/
// date/etc. -- that stays on bookings.
export const sessionProgress = sqliteTable('session_progress', {
  bookingId: text('booking_id').primaryKey().references(() => bookings.id, { onDelete: 'cascade' }),
  attendance: text('attendance').notNull().default('Not Marked'),
  hoursCompleted: real('hours_completed').notNull().default(0),
  progressStage: text('progress_stage').notNull().default('Not Started'),
  progressPercent: integer('progress_percent').notNull().default(0),
  remarks: text('remarks').notNull().default(''),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
  updatedBy: text('updated_by'),
});
