CREATE TYPE "public"."account_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "market_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" numeric NOT NULL,
	"libelle" varchar(100) NOT NULL,
	CONSTRAINT "market_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(40) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "account_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_email_display" ON "users" USING btree ("email","name");