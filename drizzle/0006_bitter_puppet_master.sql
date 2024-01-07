ALTER TABLE "academies" ADD COLUMN "is_complete" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "academy_module_groups" ADD COLUMN "is_published" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "academy_modules" ADD COLUMN "is_published" boolean DEFAULT true;