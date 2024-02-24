ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708264454511';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708264454511';--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userId_idx" ON "user_progress" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "moduleId_idx" ON "user_progress" ("module_id");