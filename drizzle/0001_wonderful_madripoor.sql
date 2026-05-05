CREATE TABLE "sports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"sports_category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sports_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sports_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sports_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
DROP TABLE "demo_users" CASCADE;--> statement-breakpoint
ALTER TABLE "sports" ADD CONSTRAINT "sports_sports_category_id_sports_categories_id_fk" FOREIGN KEY ("sports_category_id") REFERENCES "public"."sports_categories"("id") ON DELETE no action ON UPDATE no action;