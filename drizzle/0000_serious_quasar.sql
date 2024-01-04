DO $$ BEGIN
 CREATE TYPE "module_types" AS ENUM('LESSON', 'QUIZZ', 'SUBMISSION');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academy_module_groups" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"order" "smallserial" NOT NULL,
	"academy_id" varchar(50) NOT NULL,
	"is_complete" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "academy_modules" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"order" "smallserial" NOT NULL,
	"academy_module_group_id" varchar(50) NOT NULL,
	"module_types" "module_types" NOT NULL,
	"content" text NOT NULL,
	"is_complete" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"username" varchar(50) NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_module_groups" ADD CONSTRAINT "academy_module_groups_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_modules" ADD CONSTRAINT "academy_modules_academy_module_group_id_academy_module_groups_id_fk" FOREIGN KEY ("academy_module_group_id") REFERENCES "academy_module_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
