CREATE TABLE IF NOT EXISTS "user_submission_results" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"reviewer_note" text,
	"score" "smallserial" NOT NULL,
	"is_passed" boolean,
	"submission_ID" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_submissions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"note" text,
	"academy_id" varchar(50) NOT NULL,
	"module_id" varchar(50) NOT NULL,
	"file_url" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission_results" ADD CONSTRAINT "user_submission_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission_results" ADD CONSTRAINT "user_submission_results_submission_ID_user_submissions_id_fk" FOREIGN KEY ("submission_ID") REFERENCES "user_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submissions" ADD CONSTRAINT "user_submissions_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "academy_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
