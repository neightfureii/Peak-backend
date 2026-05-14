ALTER TABLE "players" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sports" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "sports_categories" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sports_categories" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();