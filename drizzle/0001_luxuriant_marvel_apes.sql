CREATE INDEX `idx_features_owner_created` ON `features` (`owner`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_notifications_owner_created` ON `notifications` (`owner`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_revisions_feature_number` ON `feature_revisions` (`feature_id`,`number`);--> statement-breakpoint
CREATE INDEX `idx_revisions_owner_feature` ON `feature_revisions` (`owner`,`feature_id`);