CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookings_date_slot` ON `bookings` (`date`,`slot`);