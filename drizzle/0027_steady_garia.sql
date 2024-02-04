CREATE TABLE IF NOT EXISTS "user_quizz_answer_histories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"quizz_history_id" varchar(50) NOT NULL,
	"question_id" varchar(50) NOT NULL,
	"answer_id" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_quizz_histories" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"module_id" varchar(50) NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"score" "smallserial" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_answer_histories" ADD CONSTRAINT "user_quizz_answer_histories_quizz_history_id_user_quizz_answer_histories_id_fk" FOREIGN KEY ("quizz_history_id") REFERENCES "user_quizz_answer_histories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_answer_histories" ADD CONSTRAINT "user_quizz_answer_histories_question_id_quizz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "quizz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_answer_histories" ADD CONSTRAINT "user_quizz_answer_histories_answer_id_quizz_answer_choices_id_fk" FOREIGN KEY ("answer_id") REFERENCES "quizz_answer_choices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_histories" ADD CONSTRAINT "user_quizz_histories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_quizz_histories" ADD CONSTRAINT "user_quizz_histories_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "academy_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
