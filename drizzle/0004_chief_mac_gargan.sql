ALTER TABLE "players" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "sports" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "sports" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "sports_categories" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "sports_categories" ALTER COLUMN "id" DROP IDENTITY;