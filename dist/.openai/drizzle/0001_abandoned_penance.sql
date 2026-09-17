CREATE TABLE `availability` (
	`date` text NOT NULL,
	`slot` text NOT NULL,
	`visible` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_availability_date_slot` ON `availability` (`date`,`slot`);