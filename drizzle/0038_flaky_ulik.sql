DO $$ BEGIN
 CREATE TYPE "academy_application_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academy_applications" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"academy_id" varchar(50) NOT NULL,
	"status" "academy_application_status" DEFAULT 'PENDING' NOT NULL,
	"message" text DEFAULT '',
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1708238318474';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1708238318474';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_applications" ADD CONSTRAINT "academy_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_applications" ADD CONSTRAINT "academy_applications_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
