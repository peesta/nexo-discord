CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `features` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`price` integer NOT NULL,
	`credit` integer DEFAULT 0 NOT NULL,
	`proposal` text NOT NULL,
	`conversation` text NOT NULL,
	`specification` text DEFAULT '' NOT NULL,
	`revisions` integer DEFAULT 0 NOT NULL,
	`error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`state` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer NOT NULL,
	PRIMARY KEY(`key`, `bucket`)
);
--> statement-breakpoint
CREATE TABLE `feature_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`feature_id` text NOT NULL,
	`owner` text NOT NULL,
	`number` integer NOT NULL,
	`message` text NOT NULL,
	`previous_spec` text NOT NULL,
	`result` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`owner` text PRIMARY KEY NOT NULL,
	`settings` text NOT NULL,
	`discord_id` text,
	`discord_name` text,
	`discord_token` text,
	`guild_id` text,
	`guild_name` text,
	`plan` text DEFAULT 'basic' NOT NULL,
	`credit` integer DEFAULT 0 NOT NULL,
	`credit_period` text,
	`stripe_customer` text,
	`stripe_subscription` text,
	`renew_date` text,
	`created_at` text NOT NULL
);
