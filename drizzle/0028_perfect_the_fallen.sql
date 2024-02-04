ALTER TABLE "user_quizz_answer_histories" DROP CONSTRAINT "user_quizz_answer_histories_quizz_history_id_user_quizz_answer_histories_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_answer_histories" ADD CONSTRAINT "user_quizz_answer_histories_quizz_history_id_user_quizz_histories_id_fk" FOREIGN KEY ("quizz_history_id") REFERENCES "user_quizz_histories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
