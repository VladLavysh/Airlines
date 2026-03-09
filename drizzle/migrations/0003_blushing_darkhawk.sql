CREATE TABLE "flight" (
	"id" serial PRIMARY KEY NOT NULL,
	"departure_time" timestamp NOT NULL,
	"arrival_time" timestamp NOT NULL,
	"flight_status" varchar(32) NOT NULL,
	"route_id" integer NOT NULL,
	"aircraft_id" integer NOT NULL,
	"airline_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "route" (
	"id" serial PRIMARY KEY NOT NULL,
	"departure_airport" varchar(32) NOT NULL,
	"arrival_airport" varchar(32) NOT NULL,
	"distance" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seat_class" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"price_multiplier" numeric(4, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE IF EXISTS "seat_classes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "seat_classes" CASCADE;--> statement-breakpoint
ALTER TABLE IF EXISTS "flight" ADD CONSTRAINT "flight_route_id_route_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."route"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE IF EXISTS "flight" ADD CONSTRAINT "flight_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE IF EXISTS "flight" ADD CONSTRAINT "flight_airline_id_airline_id_fk" FOREIGN KEY ("airline_id") REFERENCES "public"."airline"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flight_route_id_idx" ON "flight" USING btree ("route_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flight_aircraft_id_idx" ON "flight" USING btree ("aircraft_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flight_airline_id_idx" ON "flight" USING btree ("airline_id");