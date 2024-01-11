ALTER TABLE "academies" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "academy_module_groups" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "academy_modules" ADD COLUMN "is_deleted" boolean DEFAULT false;