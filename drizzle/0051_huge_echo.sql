ALTER TABLE "user_quizz_answer_histories" ALTER COLUMN "question_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_quizz_answer_histories" ALTER COLUMN "answer_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT '1709393118967';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET DEFAULT '1709393118967';