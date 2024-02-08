ALTER TABLE "academies" ADD COLUMN "deleted_by" varchar(50);--> statement-breakpoint
ALTER TABLE "academy_module_groups" ADD COLUMN "deleted_by" varchar(50);--> statement-breakpoint
ALTER TABLE "academy_modules" ADD COLUMN "deleted_by" varchar(50);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academies" ADD CONSTRAINT "academies_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_module_groups" ADD CONSTRAINT "academy_module_groups_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "academy_modules" ADD CONSTRAINT "academy_modules_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
