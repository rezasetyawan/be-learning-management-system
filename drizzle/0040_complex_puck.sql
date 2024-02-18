ALTER TYPE "academy_application_status" ADD VALUE 'APPROVED';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708251244163';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708251244163';