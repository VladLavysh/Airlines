CREATE TABLE "idempotency_key" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"request_path" varchar(255) NOT NULL,
	"request_method" varchar(10) NOT NULL,
	"user_id" integer NOT NULL,
	"response_code" integer NOT NULL,
	"response_body" varchar(10000) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "idempotency_key_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "idempotency_key" ADD CONSTRAINT "idempotency_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idempotency_key_key_idx" ON "idempotency_key" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idempotency_key_user_id_idx" ON "idempotency_key" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idempotency_key_expires_at_idx" ON "idempotency_key" USING btree ("expires_at");