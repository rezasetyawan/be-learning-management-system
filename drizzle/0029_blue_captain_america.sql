CREATE TABLE IF NOT EXISTS "module_discussion_replies" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"discussion_id" varchar(50) NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"body" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "module_discussions" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"module_id" varchar(50) NOT NULL,
	"created_at" varchar(50) NOT NULL,
	"updated_at" varchar(50) NOT NULL,
	"title" text DEFAULT '',
	"body" text DEFAULT ''
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_discussion_replies" ADD CONSTRAINT "module_discussion_replies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_discussion_replies" ADD CONSTRAINT "module_discussion_replies_discussion_id_module_discussions_id_fk" FOREIGN KEY ("discussion_id") REFERENCES "module_discussions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_discussions" ADD CONSTRAINT "module_discussions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_discussions" ADD CONSTRAINT "module_discussions_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "academy_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
