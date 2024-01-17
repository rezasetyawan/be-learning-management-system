ALTER TABLE "academies" ADD COLUMN "deleted_at" varchar(50) DEFAULT null;--> statement-breakpoint
ALTER TABLE "academy_module_groups" ADD COLUMN "deleted_at" varchar(50) DEFAULT null;--> statement-breakpoint
ALTER TABLE "academy_modules" ADD COLUMN "deleted_at" varchar(50) DEFAULT null;