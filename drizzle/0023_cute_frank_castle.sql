ALTER TABLE "quizz_answer_choices" ADD COLUMN "deleted_at" varchar(50) DEFAULT null;--> statement-breakpoint
ALTER TABLE "quizz_questions" ADD COLUMN "deleted_at" varchar(50) DEFAULT null;