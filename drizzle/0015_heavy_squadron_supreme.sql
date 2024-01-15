ALTER TABLE "quizz_answer_choices" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quizz_questions" ADD COLUMN "is_deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "quizzes" ADD COLUMN "is_deleted" boolean DEFAULT false;