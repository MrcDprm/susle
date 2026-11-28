ALTER TABLE trees ADD COLUMN IF NOT EXISTS look jsonb NOT NULL DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE trees ADD COLUMN IF NOT EXISTS note text;
