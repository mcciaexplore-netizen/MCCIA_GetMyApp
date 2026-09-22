CREATE TABLE `session_progress` (
	`booking_id` text PRIMARY KEY NOT NULL,
	`attendance` text DEFAULT 'Not Marked' NOT NULL,
	`hours_completed` real DEFAULT 0 NOT NULL,
	`progress_stage` text DEFAULT 'Not Started' NOT NULL,
	`progress_percent` integer DEFAULT 0 NOT NULL,
	`remarks` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade
);
