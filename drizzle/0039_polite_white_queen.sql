ALTER TYPE "academy_application_status" ADD VALUE 'ACCEPTED';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708251031501';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708251031501';