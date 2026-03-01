CREATE TABLE "aircraft" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"registration_number" varchar(16) NOT NULL,
	"manufacturer" varchar(64) NOT NULL,
	"year" integer NOT NULL,
	"total_seats" integer NOT NULL,
	"airline_id" integer NOT NULL,
	CONSTRAINT "aircraft_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "aircraft_airline_id_idx" ON "aircraft" USING btree ("airline_id");