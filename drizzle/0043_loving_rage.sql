ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708263651422';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708263651422';--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_module_id_unique" UNIQUE("user_id","module_id");