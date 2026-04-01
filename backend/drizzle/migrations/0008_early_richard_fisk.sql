-- Delete existing bookings since they don't have flight_id
DELETE FROM "booking";--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "flight_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_flight_id_flight_id_fk" FOREIGN KEY ("flight_id") REFERENCES "public"."flight"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "booking_flight_id_idx" ON "booking" USING btree ("flight_id");