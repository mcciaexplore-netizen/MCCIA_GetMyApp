CREATE TABLE `availability` (
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`visible` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_availability_date_slot` ON `availability` (`date`,`slot`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`app_id` text NOT NULL,
	`app_name` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_bookings_app_date_slot_email` ON `bookings` (`app_id`,`date`,`slot`,`email`);