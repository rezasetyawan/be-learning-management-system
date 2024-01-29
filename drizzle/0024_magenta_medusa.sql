CREATE TABLE IF NOT EXISTS "user_module_last_read" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"user_id" varchar(500) NOT NULL,
	"module_id" varchar(500) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_module_last_read" ADD CONSTRAINT "user_module_last_read_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_module_last_read" ADD CONSTRAINT "user_module_last_read_module_id_academy_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "academy_modules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
