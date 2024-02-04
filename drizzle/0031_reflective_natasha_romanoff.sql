ALTER TABLE "module_discussions" ADD COLUMN "academy_id" varchar(50) NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "module_discussions" ADD CONSTRAINT "module_discussions_academy_id_academies_id_fk" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
