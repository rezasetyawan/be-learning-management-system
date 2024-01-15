CREATE TABLE IF NOT EXISTS "quizz_answer_choices" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"question_id" varchar(500) NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizz_questions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"quizz_id" varchar(500) NOT NULL,
	"text" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quizzes" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"module_id" varchar(50) NOT NULL,
	"duration" "smallserial" DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quizz_answer_choices" ADD CONSTRAINT "quizz_answer_choices_question_id_quizz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "quizz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quizz_questions" ADD CONSTRAINT "quizz_questions_quizz_id_quizzes_id_fk" FOREIGN KEY ("quizz_id") REFERENCES "quizzes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "academy_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
