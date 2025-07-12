CREATE TYPE "public"."provider" AS ENUM('google', 'github', 'facebook');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"password" text,
	"last_activity" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_oauth" (
	"user_id" text NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_provider_provider_user_id_unique" UNIQUE("user_id","provider","provider_user_id")
);
--> statement-breakpoint
ALTER TABLE "users_oauth" ADD CONSTRAINT "users_oauth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_provider_idx" ON "users_oauth" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "provider_user_id_idx" ON "users_oauth" USING btree ("provider_user_id");