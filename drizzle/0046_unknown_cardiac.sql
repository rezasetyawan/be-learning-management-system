DROP INDEX IF EXISTS "userId_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "moduleId_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708264734948';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708264734948';