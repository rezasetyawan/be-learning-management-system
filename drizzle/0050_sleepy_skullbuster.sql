ALTER TABLE "user_submission_results" RENAME COLUMN "submission_ID" TO "submission_id";--> statement-breakpoint
ALTER TABLE "user_submission_results" DROP CONSTRAINT "user_submission_results_submission_ID_user_submissions_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1709211602703';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1709211602703';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_submission_results" ADD CONSTRAINT "user_submission_results_submission_id_user_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "user_submissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
