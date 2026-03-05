CREATE TABLE "seat" (
	"id" serial PRIMARY KEY NOT NULL,
	"seat_number" varchar(3) NOT NULL,
	"seat_class_id" integer NOT NULL,
	"aircraft_id" integer NOT NULL,
	CONSTRAINT "unique_seat_number_per_aircraft" UNIQUE("seat_number","aircraft_id")
);
--> statement-breakpoint
CREATE TABLE "seat_classes" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "seat_classes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" varchar(20) NOT NULL,
	"price_multiplier" numeric(5, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seat" ADD CONSTRAINT "seat_seat_class_id_seat_classes_id_fk" FOREIGN KEY ("seat_class_id") REFERENCES "public"."seat_classes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "seat" ADD CONSTRAINT "seat_aircraft_id_aircraft_id_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "seat_seat_class_id_idx" ON "seat" USING btree ("seat_class_id");--> statement-breakpoint
CREATE INDEX "seat_aircraft_id_idx" ON "seat" USING btree ("aircraft_id");

INSERT INTO "seat_classes" (name, price_multiplier)
VALUES
  ('Economy', 1.0),
  ('Premium Economy', 1.5),
  ('Business', 2.5),
  ('First Class', 3.5);

INSERT INTO seat (seat_number, seat_class_id, aircraft_id)
VALUES
  ('A1', 4, 1),
  ('A2', 4, 1),
  ('A3', 4, 1),
  ('A4', 4, 1),
  ('A5', 4, 1),
  ('A6', 4, 1),
  ('A7', 4, 1),
  ('A8', 4, 1),
  ('A9', 4, 1),
  ('A10', 4, 1),
  ('B1', 3, 1),
  ('B2', 3, 1),
  ('B3', 3, 1),
  ('B4', 3, 1),
  ('B5', 3, 1),
  ('B6', 2, 1),
  ('B7', 2, 1),
  ('B8', 2, 1),
  ('B9', 2, 1),
  ('B10', 2, 1),
  ('C1', 1, 1),
  ('C2', 1, 1),
  ('C3', 1, 1),
  ('C4', 1, 1),
  ('C5', 1, 1),
  ('C6', 1, 1),
  ('C7', 1, 1),
  ('C8', 1, 1),
  ('C9', 1, 1),
  ('C10', 1, 1);