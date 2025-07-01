CREATE TYPE "public"."provider" AS ENUM('google', 'github', 'facebook');--> statement-breakpoint
CREATE TABLE "users_oauth" (
	"user_id" text NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users_oauth" ADD CONSTRAINT "users_oauth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_provider_idx" ON "users_oauth" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "provider_user_id_idx" ON "users_oauth" USING btree ("provider_user_id");