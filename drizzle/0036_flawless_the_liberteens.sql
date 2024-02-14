DO $$ BEGIN
 CREATE TYPE "submisssion_status" AS ENUM('PENDING', 'REVIEW', 'REVIEWED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "user_submissions" ADD COLUMN "status" "submisssion_status" DEFAULT 'PENDING' NOT NULL;