ALTER TABLE "user_module_last_read" ADD COLUMN "academy_id" varchar(500) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_module_last_read" ADD CONSTRAINT "user_module_last_read_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
