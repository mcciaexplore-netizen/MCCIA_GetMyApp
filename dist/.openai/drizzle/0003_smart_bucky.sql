CREATE TABLE `app_schedule_extra` (
	`app_id` text NOT NULL,
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_app_schedule_extra` ON `app_schedule_extra` (`app_id`,`date`,`slot`);