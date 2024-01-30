ALTER TABLE "user_module_last_read" ADD COLUMN "module_group_id" varchar(500) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_module_last_read" ADD CONSTRAINT "user_module_last_read_module_group_id_academy_module_groups_id_fk" FOREIGN KEY ("module_group_id") REFERENCES "academy_module_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
